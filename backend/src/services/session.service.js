import ParkingSession from '../models/parking-session.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
import ParkingRow from '../models/parking-row.model.js';
import Floor from '../models/floor.model.js';
import Subscription from '../models/subscription.model.js';
import Payment from '../models/payment.model.js';
import User from '../models/user.model.js';
import * as pricingService from './pricing.service.js';
import * as payosService from './payos.service.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

const SESSION_POPULATE = [
  {
    path: 'slotId',
    select: 'slotCode vehicleType floorId',
    populate: { path: 'floorId', select: 'floorNumber buildingId' },
  },
  {
    path: 'rowId',
    select: 'rowCode capacity occupiedCount floorId',
    populate: { path: 'floorId', select: 'floorNumber buildingId' },
  },
  { path: 'staffId', select: 'fullName email' },
  { path: 'userId',  select: 'fullName phone email' },
];

export const checkIn = async ({ slotId, rowId, licensePlate, vehicleType, staffId, note }) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');

  const existing = await ParkingSession.findOne({ licensePlate: normalizedPlate, status: 'active' });
  if (existing) {
    throw new AppError(`Vehicle ${normalizedPlate} already has an active parking session`, 400);
  }

  const activeSub = await Subscription.findOne({ licensePlate: normalizedPlate, status: 'active' });
  if (activeSub && activeSub.vehicleType !== vehicleType) {
    throw new AppError(
      `License plate ${normalizedPlate} has a ${activeSub.vehicleType} subscription, cannot check in as ${vehicleType}`,
      400
    );
  }
  const userId = activeSub ? activeSub.userId : null;

  if (vehicleType === 'car') {
    const isResident = !!activeSub;
    const resolvedSlotId = isResident ? activeSub.slotId?.toString() : slotId;

    if (isResident && !resolvedSlotId) {
      throw new AppError('Resident subscription has no slot assigned. Contact admin.', 500);
    }
    if (!isResident && !slotId) {
      throw new AppError('slotId is required for walk-in car check-in', 400);
    }
    if (isResident && slotId && slotId !== resolvedSlotId) {
      throw new AppError(
        `This plate is bound to slot ${activeSub.slotId} via subscription. slotId in body does not match.`,
        400
      );
    }

    const slot = await ParkingSlot.findById(resolvedSlotId).populate({
      path: 'floorId',
      select: 'isActive vehicleType floorType buildingId',
      populate: { path: 'buildingId', select: 'isActive' },
    });
    if (!slot) throw new AppError('Parking slot not found', 404);
    if (!slot.floorId.isActive) throw new AppError('Floor is inactive', 400);
    if (!slot.floorId.buildingId?.isActive) throw new AppError('Building is inactive', 400);
    if (slot.floorId.vehicleType !== 'car') throw new AppError('This slot only accepts car', 400);
    if (slot.floorId.floorType === 'resident' && !isResident)
      throw new AppError('This floor is for residents only. License plate has no active subscription.', 403);
    if (slot.floorId.floorType === 'visitor' && isResident)
      throw new AppError('This floor is for visitors only. Residents must park on their reserved slot.', 403);

    const expectedSlotStatus = isResident ? 'reserved' : 'empty';
    const locked = await ParkingSlot.findOneAndUpdate(
      { _id: resolvedSlotId, status: expectedSlotStatus },
      { status: 'occupied' },
      { new: true }
    );
    if (!locked)
      throw new AppError(
        `Slot is not available for check-in (expected status: ${expectedSlotStatus}, current: ${slot.status})`,
        409
      );

    try {
      const session = await ParkingSession.create({
        slotId: resolvedSlotId,
        rowId: null,
        licensePlate: normalizedPlate,
        vehicleType,
        customerType: isResident ? 'resident' : 'walk_in',
        subscriptionId: activeSub?._id || null,
        entryTime: new Date(),
        staffId,
        userId: userId || null,
        status: 'active',
        paymentStatus: isResident ? 'paid' : 'unpaid',
        note,
      });
      return session.populate(SESSION_POPULATE);
    } catch (err) {
      await ParkingSlot.findByIdAndUpdate(resolvedSlotId, { status: expectedSlotStatus });
      throw err;
    }
  }

  const row = await ParkingRow.findById(rowId).populate({
    path: 'floorId',
    select: 'isActive vehicleType floorType buildingId',
    populate: { path: 'buildingId', select: 'isActive' },
  });
  if (!row) throw new AppError('Parking row not found', 404);
  if (!row.floorId.isActive) throw new AppError('Floor is inactive', 400);
  if (!row.floorId.buildingId?.isActive) throw new AppError('Building is inactive', 400);
  if (row.floorId.vehicleType !== 'motorcycle') throw new AppError('This row only accepts motorcycle', 400);
  if (row.floorId.floorType === 'resident' && !activeSub)
    throw new AppError('This floor is for residents only. License plate has no active subscription.', 403);
  if (row.floorId.floorType === 'visitor' && activeSub)
    throw new AppError('This floor is for visitors only. Residents must park on resident floor.', 403);

  const newOccupied = row.occupiedCount + 1;

  const locked = await ParkingRow.findOneAndUpdate(
    { _id: rowId, status: { $ne: 'maintenance' }, occupiedCount: { $lt: row.capacity } },
    {
      $inc: { occupiedCount: 1 },
      $set: { status: newOccupied >= row.capacity ? 'full' : 'available' },
    },
    { new: true }
  );
  if (!locked) throw new AppError(`Row is full or under maintenance (${row.occupiedCount}/${row.capacity})`, 409);

  try {
    const session = await ParkingSession.create({
      slotId: null,
      rowId,
      licensePlate: normalizedPlate,
      vehicleType,
      customerType: activeSub ? 'resident' : 'walk_in',
      subscriptionId: activeSub?._id || null,
      entryTime: new Date(),
      staffId,
      userId: userId || null,
      status: 'active',
      paymentStatus: activeSub ? 'paid' : 'unpaid',
      note,
    });
    return session.populate(SESSION_POPULATE);
  } catch (err) {
    await ParkingRow.findByIdAndUpdate(rowId, {
      $inc: { occupiedCount: -1 },
      $set: { status: row.status },
    });
    throw err;
  }
};

export const getActiveSessions = async ({ page = 1, limit = 20, vehicleType, licensePlate, floorId, buildingId } = {}) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const filter = { status: 'active' };
  if (vehicleType) filter.vehicleType = vehicleType;
  if (licensePlate) filter.licensePlate = new RegExp(licensePlate.toUpperCase(), 'i');

  if (floorId || buildingId) {
    const floorIds = floorId
      ? [floorId]
      : (await Floor.find({ buildingId }).select('_id')).map((f) => f._id);

    const [slots, rows] = await Promise.all([
      ParkingSlot.find({ floorId: { $in: floorIds } }).select('_id'),
      ParkingRow.find({ floorId: { $in: floorIds } }).select('_id'),
    ]);

    filter.$or = [
      { slotId: { $in: slots.map((s) => s._id) } },
      { rowId:  { $in: rows.map((r) => r._id) } },
    ];
  }

  const skip = (pageNum - 1) * limitNum;
  const [sessions, total] = await Promise.all([
    ParkingSession.find(filter)
      .populate(SESSION_POPULATE)
      .skip(skip)
      .limit(limitNum)
      .sort({ entryTime: -1 }),
    ParkingSession.countDocuments(filter),
  ]);
  return { sessions, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
};

export const getById = async (id) => {
  const session = await ParkingSession.findById(id).populate(SESSION_POPULATE);
  if (!session) throw new AppError('Session not found', 404);
  return session;
};

export const lookup = async (licensePlate) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');

  const [activeSession, activeSub, lastSession, availableCar, motoAgg] = await Promise.all([
    ParkingSession.findOne({ licensePlate: normalizedPlate, status: 'active' }).populate(SESSION_POPULATE),
    Subscription.findOne({ licensePlate: normalizedPlate, status: 'active' })
      .populate('planId', 'code name vehicleType durationDays price')
      .populate('userId', 'fullName phone email'),
    ParkingSession.findOne({ licensePlate: normalizedPlate, status: { $in: ['completed', 'cancelled'] } })
      .sort({ exitTime: -1 })
      .populate('userId', 'fullName phone email')
      .select('userId entryTime exitTime vehicleType fee'),
    ParkingSlot.countDocuments({ vehicleType: 'car', status: 'empty' }),
    ParkingRow.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: null, available: { $sum: { $subtract: ['$capacity', '$occupiedCount'] } } } },
    ]),
  ]);

  const availableMotorcycle = motoAgg[0]?.available || 0;

  return {
    licensePlate: normalizedPlate,
    status: activeSession ? 'already_active' : 'available',
    customerType: activeSub ? 'resident' : 'walk_in',
    activeSession: activeSession || null,
    subscription: activeSub
      ? {
          _id: activeSub._id,
          plan: activeSub.planId,
          owner: activeSub.userId,
          startDate: activeSub.startDate,
          endDate: activeSub.endDate,
          vehicleType: activeSub.vehicleType,
        }
      : null,
    hint: {
      lastVisit: lastSession
        ? {
            vehicleType: lastSession.vehicleType,
            entryTime: lastSession.entryTime,
            exitTime: lastSession.exitTime,
            fee: lastSession.fee,
          }
        : null,
    },
    availableSlots: {
      motorcycle: availableMotorcycle,
      car: availableCar,
    },
  };
};

const releaseSpot = async (session) => {
  if (session.slotId) {
    const targetStatus = session.customerType === 'resident' ? 'reserved' : 'empty';
    await ParkingSlot.findByIdAndUpdate(session.slotId, { status: targetStatus });
    return;
  }
  if (!session.rowId) return;

  await ParkingRow.findOneAndUpdate(
    { _id: session.rowId, occupiedCount: { $gt: 0 }, status: { $ne: 'maintenance' } },
    { $inc: { occupiedCount: -1 }, $set: { status: 'available' } }
  );
};

const loadActiveSession = async (id) => {
  const session = await ParkingSession.findById(id);
  if (!session) throw new AppError('Session not found', 404);
  if (session.status !== 'active')
    throw new AppError(`Session is already ${session.status}`, 400);
  return session;
};

export const previewCheckout = async (id) => {
  const session = await loadActiveSession(id);
  const exitTime = new Date();

  if (session.customerType === 'resident') {
    return {
      sessionId: session._id,
      customerType: 'resident',
      entryTime: session.entryTime,
      exitTime,
      fee: 0,
      breakdown: null,
      pricing: null,
      note: 'Resident with active subscription — no fee',
    };
  }

  const calc = await pricingService.calculateFee({
    vehicleType: session.vehicleType,
    entryTime: session.entryTime,
    exitTime,
  });

  return {
    sessionId: session._id,
    customerType: 'walk_in',
    entryTime: session.entryTime,
    exitTime,
    fee: calc.total,
    breakdown: calc.breakdown,
    pricing: calc.pricing,
  };
};

const closeSessionPaid = async (session, { method, exitTime, fee, breakdown, paidAt, collectorId }) => {
  const updated = await ParkingSession.findOneAndUpdate(
    { _id: session._id, status: 'active' },
    {
      status: 'completed',
      exitTime,
      fee,
      feeBreakdown: breakdown || {},
      paymentMethod: method,
      paymentStatus: 'paid',
      paidAt,
      cashCollectedBy: method === 'cash' ? collectorId : null,
      checkOutStaffId: collectorId,
    },
    { new: true }
  );
  if (!updated) throw new AppError('Session was not active when closing', 409);

  await releaseSpot(session);
  return updated.populate(SESSION_POPULATE);
};

export const checkOutCash = async (id, staffId) => {
  const session = await loadActiveSession(id);
  const exitTime = new Date();
  const collectorId = staffId;

  if (session.customerType === 'resident') {
    return closeSessionPaid(session, {
      method: 'cash',
      exitTime,
      fee: 0,
      breakdown: {},
      paidAt: exitTime,
      collectorId,
    });
  }

  const calc = await pricingService.calculateFee({
    vehicleType: session.vehicleType,
    entryTime: session.entryTime,
    exitTime,
  });

  return closeSessionPaid(session, {
    method: 'cash',
    exitTime,
    fee: calc.total,
    breakdown: calc.breakdown,
    paidAt: exitTime,
    collectorId,
  });
};

export const checkOutTransfer = async (id, staffId) => {
  const session = await loadActiveSession(id);

  if (session.customerType === 'resident') {
    return {
      session: await closeSessionPaid(session, {
        method: 'transfer',
        exitTime: new Date(),
        fee: 0,
        breakdown: {},
        paidAt: new Date(),
        collectorId: staffId,
      }),
      payment: null,
      note: 'Resident with active subscription — no payment needed; session closed.',
    };
  }

  const existingPending = await Payment.findOne({
    sessionId: session._id,
    status: 'pending',
  });
  if (existingPending) {
    return {
      session,
      payment: {
        orderCode: existingPending.orderCode,
        amount: existingPending.amount,
        checkoutUrl: existingPending.checkoutUrl,
        paymentLinkId: existingPending.paymentLinkId,
        qrCode: existingPending.providerData?.qrCode || null,
      },
      note: 'A pending PayOS link already exists for this session; reuse it.',
    };
  }

  const exitTime = new Date();
  const calc = await pricingService.calculateFee({
    vehicleType: session.vehicleType,
    entryTime: session.entryTime,
    exitTime,
  });

  await ParkingSession.findByIdAndUpdate(session._id, {
    paymentMethod: 'transfer',
    paymentStatus: 'pending',
    fee: calc.total,
    feeBreakdown: calc.breakdown,
    checkOutStaffId: staffId,
  });

  const orderCode = payosService.generateOrderCode();
  const staff = await User.findById(staffId).select('fullName email phone');

  let payosResponse;
  try {
    payosResponse = await payosService.createPaymentLink({
      orderCode,
      amount: calc.total,
      description: `Park ${session.licensePlate}`,
      items: [{ name: `Parking ${session.vehicleType}`, quantity: 1, price: calc.total }],
      buyerName: staff?.fullName,
      buyerEmail: staff?.email,
      buyerPhone: staff?.phone,
    });
  } catch (err) {
    await ParkingSession.findByIdAndUpdate(session._id, {
      paymentMethod: null,
      paymentStatus: 'unpaid',
      fee: 0,
      feeBreakdown: {},
      checkOutStaffId: null,
    });
    throw err;
  }

  const payment = await Payment.create({
    targetType: 'session',
    sessionId: session._id,
    userId: session.userId || null,
    provider: 'payos',
    orderCode,
    amount: calc.total,
    description: `Park ${session.licensePlate} ${session.vehicleType}`,
    status: 'pending',
    checkoutUrl: payosResponse.checkoutUrl,
    paymentLinkId: payosResponse.paymentLinkId,
    providerData: payosResponse,
  });

  return {
    session: await session.populate(SESSION_POPULATE),
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
    fee: calc.total,
    breakdown: calc.breakdown,
  };
};

export const activateSessionFromWebhook = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment || payment.targetType !== 'session') return null;

  const session = await ParkingSession.findById(payment.sessionId);
  if (!session) {
    logger.error('Session missing for paid payment', { paymentId });
    return null;
  }
  if (session.status !== 'active') {
    return { alreadyClosed: true, sessionId: session._id };
  }

  const closed = await closeSessionPaid(session, {
    method: 'transfer',
    exitTime: new Date(),
    fee: payment.amount,
    breakdown: session.feeBreakdown,
    paidAt: payment.paidAt || new Date(),
    collectorId: session.checkOutStaffId,
  });
  return { closed: true, sessionId: closed._id };
};
