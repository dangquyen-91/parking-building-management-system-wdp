import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import ParkingSession from '../models/parking-session.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
import Floor from '../models/floor.model.js';
import * as payosService from './payos.service.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;
const CAR_BASE_FEE = 20000;
const CAR_DAILY_CAP = 120000;
const MAX_FUTURE_MS = 24 * HOUR_MS;
const MIN_DURATION_HOURS = 1;
const MAX_DURATION_HOURS = 24;

const BOOKING_POPULATE = [
  { path: 'userId', select: 'fullName email phone' },
  { path: 'sessionId', select: 'entryTime exitTime status' },
];

const computeAmount = (durationHours) => {
  const fullDays = Math.floor(durationHours / 24);
  const remainderHours = durationHours - fullDays * 24;
  const remainderFee = Math.min(remainderHours * CAR_BASE_FEE, CAR_DAILY_CAP);
  return fullDays * CAR_DAILY_CAP + remainderFee;
};

const getVisitorCarCapacity = async () => {
  const floors = await Floor.find({
    vehicleType: 'car',
    floorType: 'visitor',
    isActive: true,
  }).select('totalSlots');
  return floors.reduce((sum, f) => sum + f.totalSlots, 0);
};

const countOverlappingBookings = async (arrivalTime, exitTime, excludeId) => {
  const filter = {
    status: { $in: ['paid', 'used'] },
    expectedArrivalTime: { $lt: exitTime },
    expectedExitTime: { $gt: arrivalTime },
  };
  if (excludeId) filter._id = { $ne: excludeId };
  return Booking.countDocuments(filter);
};

const countCurrentVisitorCarSessions = async () => {
  const floors = await Floor.find({
    vehicleType: 'car',
    floorType: 'visitor',
    isActive: true,
  }).select('_id');
  const floorIds = floors.map((f) => f._id);

  const slots = await ParkingSlot.find({ floorId: { $in: floorIds } }).select('_id');
  return ParkingSession.countDocuments({
    status: 'active',
    slotId: { $in: slots.map((s) => s._id) },
  });
};

export const create = async ({ phoneNumber, licensePlate, expectedArrivalTime, expectedExitTime, userId }) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');
  const arrival = new Date(expectedArrivalTime);
  const exit = new Date(expectedExitTime);
  const now = new Date();

  if (Number.isNaN(arrival.getTime()) || Number.isNaN(exit.getTime())) {
    throw new AppError('Invalid date format for expectedArrivalTime or expectedExitTime', 400);
  }
  if (arrival <= now) {
    throw new AppError('expectedArrivalTime must be in the future', 400);
  }
  if (arrival.getTime() - now.getTime() > MAX_FUTURE_MS) {
    throw new AppError('Bookings can only be made up to 24 hours in advance', 400);
  }
  if (exit <= arrival) {
    throw new AppError('expectedExitTime must be after expectedArrivalTime', 400);
  }
  const durationHours = Math.ceil((exit.getTime() - arrival.getTime()) / HOUR_MS);
  if (durationHours < MIN_DURATION_HOURS) {
    throw new AppError(`Booking duration must be at least ${MIN_DURATION_HOURS} hour(s)`, 400);
  }
  if (durationHours > MAX_DURATION_HOURS) {
    throw new AppError(`Booking duration cannot exceed ${MAX_DURATION_HOURS} hours`, 400);
  }

  const activeSession = await ParkingSession.findOne({
    licensePlate: normalizedPlate,
    status: 'active',
  });
  if (activeSession) {
    throw new AppError(
      `License plate ${normalizedPlate} currently has an active parking session. Wait until it exits.`,
      400
    );
  }

  const overlappingPlate = await Booking.findOne({
    licensePlate: normalizedPlate,
    status: { $in: ['pending', 'paid', 'used'] },
    expectedArrivalTime: { $lt: exit },
    expectedExitTime: { $gt: arrival },
  });
  if (overlappingPlate) {
    throw new AppError(
      `License plate ${normalizedPlate} already has a booking overlapping this time range`,
      409
    );
  }

  const capacity = await getVisitorCarCapacity();
  if (capacity === 0) {
    throw new AppError('No visitor car floor configured', 500);
  }

  const isArrivalToday = arrival.toDateString() === now.toDateString();
  const overlapCount = await countOverlappingBookings(arrival, exit);
  const occupiedNow = isArrivalToday ? await countCurrentVisitorCarSessions() : 0;

  if (overlapCount + occupiedNow >= capacity) {
    throw new AppError(
      `No availability in the requested time window (capacity ${capacity}, taken ${overlapCount + occupiedNow})`,
      409
    );
  }

  const amount = computeAmount(durationHours);

  const booking = await Booking.create({
    phoneNumber: phoneNumber.trim(),
    licensePlate: normalizedPlate,
    vehicleType: 'car',
    expectedArrivalTime: arrival,
    expectedExitTime: exit,
    durationHours,
    amount,
    status: 'pending',
    userId: userId || null,
  });

  const orderCode = payosService.generateOrderCode();
  let payosResponse;
  try {
    payosResponse = await payosService.createPaymentLink({
      orderCode,
      amount,
      description: `Book ${normalizedPlate}`,
      items: [{ name: `Car parking ${durationHours}h`, quantity: 1, price: amount }],
      buyerName: 'Booking Customer',
      buyerEmail: undefined,
      buyerPhone: phoneNumber.trim(),
    });
  } catch (err) {
    await Booking.findByIdAndDelete(booking._id);
    throw err;
  }

  const payment = await Payment.create({
    targetType: 'booking',
    bookingId: booking._id,
    userId: userId || null,
    provider: 'payos',
    orderCode,
    amount,
    description: `Booking ${normalizedPlate} ${durationHours}h`,
    status: 'pending',
    checkoutUrl: payosResponse.checkoutUrl,
    paymentLinkId: payosResponse.paymentLinkId,
    providerData: payosResponse,
  });

  booking.paymentId = payment._id;
  await booking.save();

  return {
    booking: await booking.populate(BOOKING_POPULATE),
    payment: {
      orderCode: payment.orderCode,
      amount: payment.amount,
      checkoutUrl: payment.checkoutUrl,
      paymentLinkId: payment.paymentLinkId,
      qrCode: payosResponse.qrCode,
      accountNumber: payosResponse.accountNumber,
      accountName: payosResponse.accountName,
      bin: payosResponse.bin,
    },
  };
};

export const lookup = async ({ phoneNumber, licensePlate }) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');
  const bookings = await Booking.find({
    phoneNumber: phoneNumber.trim(),
    licensePlate: normalizedPlate,
  })
    .populate(BOOKING_POPULATE)
    .sort({ createdAt: -1 })
    .limit(20);
  return { bookings };
};

export const getMyBookings = async (userId, { status } = {}) => {
  const filter = { userId };
  if (status) filter.status = status;
  return Booking.find(filter).populate(BOOKING_POPULATE).sort({ createdAt: -1 });
};

export const getById = async (id) => {
  const booking = await Booking.findById(id).populate(BOOKING_POPULATE);
  if (!booking) throw new AppError('Booking not found', 404);
  return booking;
};

export const getAll = async ({ page = 1, limit = 20, status, licensePlate, phoneNumber } = {}) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const filter = {};
  if (status) filter.status = status;
  if (licensePlate) filter.licensePlate = new RegExp(licensePlate.toUpperCase(), 'i');
  if (phoneNumber) filter.phoneNumber = phoneNumber.trim();

  const skip = (pageNum - 1) * limitNum;
  const [bookings, total] = await Promise.all([
    Booking.find(filter)
      .populate(BOOKING_POPULATE)
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 }),
    Booking.countDocuments(filter),
  ]);
  return { bookings, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
};

export const cancel = async ({ id, userId, phoneNumber, licensePlate }) => {
  const booking = await Booking.findById(id);
  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.userId) {
    if (!userId || booking.userId.toString() !== userId.toString()) {
      throw new AppError('Only the booking owner can cancel this booking', 403);
    }
  } else {
    if (!phoneNumber || !licensePlate) {
      throw new AppError('Anonymous booking requires phoneNumber + licensePlate to cancel', 400);
    }
    const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');
    if (booking.phoneNumber !== phoneNumber.trim() || booking.licensePlate !== normalizedPlate) {
      throw new AppError('phoneNumber or licensePlate does not match', 403);
    }
  }

  if (!['pending', 'paid'].includes(booking.status)) {
    throw new AppError(`Cannot cancel a ${booking.status} booking`, 400);
  }
  if (booking.status === 'paid') {
    throw new AppError(
      'Paid bookings cannot be cancelled (no refund policy). Contact admin if needed.',
      400
    );
  }

  const payment = await Payment.findOne({ bookingId: id, status: 'pending' });
  if (payment) {
    try {
      await payosService.cancelPaymentLink(payment.orderCode, 'User cancelled booking');
    } catch (err) {
      logger.warn('Failed to cancel PayOS payment link', { error: err.message });
    }
    payment.status = 'cancelled';
    await payment.save();
  }

  booking.status = 'cancelled';
  await booking.save();
  return booking.populate(BOOKING_POPULATE);
};

export const findPaidBookingForCheckIn = async (licensePlate) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');
  const now = new Date();
  return Booking.findOne({
    licensePlate: normalizedPlate,
    status: 'paid',
    expectedExitTime: { $gt: now },
  }).sort({ expectedArrivalTime: 1 });
};

export const markUsed = async (bookingId, sessionId) => {
  return Booking.findOneAndUpdate(
    { _id: bookingId, status: 'paid' },
    { status: 'used', sessionId, usedAt: new Date() },
    { new: true }
  );
};

export const activateBookingFromWebhook = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment || payment.targetType !== 'booking') return null;
  const booking = await Booking.findOneAndUpdate(
    { _id: payment.bookingId, status: 'pending' },
    { status: 'paid' },
    { new: true }
  );
  if (!booking) {
    logger.warn('Booking not found or not pending when activating', { paymentId });
    return { alreadyProcessed: true };
  }
  return { activated: true, bookingId: booking._id };
};
