import Booking from '../models/booking.model.js';
import Payment from '../models/payment.model.js';
import ParkingSession from '../models/parking-session.model.js';
import Floor from '../models/floor.model.js';
import * as payosService from './payos.service.js';
import * as emailService from './email.service.js';
import * as pricingService from './pricing.service.js';
import { signBookingQRToken } from '../utils/qrToken.js';
import AppError from '../utils/appError.js';

const HOUR_MS = 60 * 60 * 1000;
const MAX_FUTURE_MS = 24 * HOUR_MS;
const MIN_DURATION_HOURS = 1; // bookings are by the hour
const MAX_DURATION_HOURS = 24;

const BOOKING_POPULATE = [
  { path: 'userId', select: 'fullName email phone' },
  { path: 'sessionId', select: 'entryTime exitTime status' },
];

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

  // Walk-in cars are counter-based on the floor (no fixed slot) → count by floorId.
  return ParkingSession.countDocuments({
    status: 'active',
    vehicleType: 'car',
    floorId: { $in: floorIds },
  });
};

export const create = async ({ email, phone, licensePlate, expectedArrivalTime, expectedExitTime, userId }) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPhone = phone?.trim() || null;
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
  // Booked by the hour; a partial hour rounds up (matches hourly pricing).
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

  const { total: amount, breakdown: feeBreakdown } = await pricingService.calculateFee({
    vehicleType: 'car',
    entryTime: arrival,
    exitTime: exit,
  });

  const booking = await Booking.create({
    email: normalizedEmail,
    phone: normalizedPhone,
    licensePlate: normalizedPlate,
    vehicleType: 'car',
    expectedArrivalTime: arrival,
    expectedExitTime: exit,
    durationHours,
    amount,
    feeBreakdown,
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
      buyerEmail: normalizedEmail,
      buyerPhone: normalizedPhone || undefined,
      // Match the stale-pending cancel window (booking.job = 15 min) so the link
      // dies before the order is auto-cancelled.
      expiresInSeconds: 15 * 60,
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

export const lookup = async ({ email, licensePlate }) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');
  const bookings = await Booking.find({
    email: email.trim().toLowerCase(),
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

export const getAll = async ({ page = 1, limit = 20, status, licensePlate, email } = {}) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const filter = {};
  if (status) filter.status = status;
  if (licensePlate) filter.licensePlate = new RegExp(licensePlate.toUpperCase(), 'i');
  if (email) filter.email = email.trim().toLowerCase();

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

export const cancel = async ({ id, userId, email, licensePlate }) => {
  const booking = await Booking.findById(id);
  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.userId) {
    if (!userId || booking.userId.toString() !== userId.toString()) {
      throw new AppError('Only the booking owner can cancel this booking', 403);
    }
  } else {
    if (!email || !licensePlate) {
      throw new AppError('Anonymous booking requires email + licensePlate to cancel', 400);
    }
    const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');
    if (booking.email !== email.trim().toLowerCase() || booking.licensePlate !== normalizedPlate) {
      throw new AppError('email or licensePlate does not match', 403);
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
      console.warn('Failed to cancel PayOS payment link', { error: err.message });
    }
    payment.status = 'cancelled';
    await payment.save();
  }

  booking.status = 'cancelled';
  await booking.save();
  return booking.populate(BOOKING_POPULATE);
};

// Active confirmation from the return-url flow: query PayOS directly so a paid
// booking flips pending -> paid near-instantly instead of waiting for the webhook.
export const confirm = async ({ id, userId, email, licensePlate }) => {
  const booking = await Booking.findById(id);
  if (!booking) throw new AppError('Booking not found', 404);

  if (booking.userId) {
    if (!userId || booking.userId.toString() !== userId.toString()) {
      throw new AppError('Only the booking owner can confirm this booking', 403);
    }
  } else {
    if (!email || !licensePlate) {
      throw new AppError('Anonymous booking requires email + licensePlate to confirm', 400);
    }
    const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');
    if (booking.email !== email.trim().toLowerCase() || booking.licensePlate !== normalizedPlate) {
      throw new AppError('email or licensePlate does not match', 403);
    }
  }

  if (booking.status === 'pending') {
    const payment = await Payment.findOne({ bookingId: id }).sort({ createdAt: -1 });
    if (!payment) throw new AppError('No payment found for this booking', 404);
    const { confirmPaymentByOrderCode } = await import('./subscription.service.js');
    await confirmPaymentByOrderCode(payment.orderCode);
  }

  return Booking.findById(id).populate(BOOKING_POPULATE);
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
    console.warn('Booking not found or not pending when activating', { paymentId });
    return { alreadyProcessed: true };
  }

  // Mint a booking QR (reused at check-in + check-out, valid until exit time)
  // so the customer can check in/out straight from the confirmation email.
  booking.qrToken = signBookingQRToken(booking._id, booking.licensePlate);
  await booking.save();

  // Fire-and-forget confirmation email with the QR attached (does not block/throw)
  emailService.sendBookingConfirmation(booking);

  return { activated: true, bookingId: booking._id };
};

// Payment failed/cancelled → cancel booking immediately (no slot held)
export const cancelBookingFromWebhook = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment || payment.targetType !== 'booking') return null;
  const booking = await Booking.findOneAndUpdate(
    { _id: payment.bookingId, status: 'pending' },
    { status: 'cancelled' },
    { new: true }
  );
  if (!booking) {
    console.warn('Booking not found or not pending when cancelling', { paymentId });
    return { alreadyProcessed: true };
  }
  console.log('Booking cancelled due to failed/cancelled payment', { bookingId: booking._id });
  return { cancelled: true, bookingId: booking._id };
};
