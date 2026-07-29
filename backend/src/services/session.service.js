import ParkingSession from '../models/parking-session.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
import ParkingRow from '../models/parking-row.model.js';
import Floor from '../models/floor.model.js';
import Subscription from '../models/subscription.model.js';
import Payment from '../models/payment.model.js';
import User from '../models/user.model.js';
import Incident from '../models/incident.model.js';
import Booking from '../models/booking.model.js';
import * as pricingService from './pricing.service.js';
import * as payosService from './payos.service.js';
import * as bookingService from './booking.service.js';
import AppError from '../utils/appError.js';
import QRCode from 'qrcode';
import { verifyQRToken, signWalkInTicket } from '../utils/qrToken.js';

const WALKIN_TICKET_TTL_MS = 5 * 60 * 1000; // must be redeemed at check-in within 5 minutes

// Both customer types carry exactly one QR for the whole visit, never
// re-minted: residents reuse their permanent subscription QR, walk-ins reuse
// the ticket minted at requestEntryQR (verified again here, then persisted
// as-is on the session so checkout matches the same physical ticket).
const attachQR = async (session, activeSub, qrToken) => {
  const finalToken = activeSub ? activeSub.qrToken : qrToken;
  if (!activeSub) {
    await ParkingSession.findByIdAndUpdate(session._id, { qrToken: finalToken });
  }
  const qrImage = await QRCode.toDataURL(finalToken, { errorCorrectionLevel: 'M', width: 300, margin: 2 });
  const populated = await session.populate(SESSION_POPULATE);
  return { session: populated, qrToken: finalToken, qrImage };
};

// Step 1 of walk-in entry: gate camera reads a plate with no subscription
// behind it. Mint the ticket QR for that exact plate; the gate scans it back
// (step 2, inside checkIn) to confirm check-in, then the same QR is kept for
// the rest of the visit and presented again at checkout.
export const requestEntryQR = async (licensePlate) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');

  const existing = await ParkingSession.findOne({ licensePlate: normalizedPlate, status: 'active' });
  if (existing) {
    throw new AppError(`Vehicle ${normalizedPlate} already has an active parking session`, 400);
  }

  const qrToken = signWalkInTicket(normalizedPlate);
  const qrImage = await QRCode.toDataURL(qrToken, { errorCorrectionLevel: 'M', width: 300, margin: 2 });
  return { qrToken, qrImage, licensePlate: normalizedPlate };
};

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
  {
    path: 'floorId',
    select: 'floorNumber section floorType vehicleType buildingId',
    populate: { path: 'buildingId', select: 'name' },
  },
  { path: 'staffId', select: 'fullName email' },
  { path: 'userId',  select: 'fullName phone email' },
];

export const checkIn = async ({ slotId, rowId, licensePlate, vehicleType, staffId, note, qrToken }) => {
  const normalizedPlate = licensePlate.toUpperCase().replace(/\s/g, '');

  const existing = await ParkingSession.findOne({ licensePlate: normalizedPlate, status: 'active' });
  if (existing) {
    throw new AppError(`Vehicle ${normalizedPlate} already has an active parking session`, 400);
  }

  const activeSub = await Subscription.findOne({ licensePlate: normalizedPlate, status: 'active' }).select('+qrToken');
  if (activeSub && activeSub.vehicleType !== vehicleType) {
    throw new AppError(
      `License plate ${normalizedPlate} has a ${activeSub.vehicleType} subscription, cannot check in as ${vehicleType}`,
      400
    );
  }

  // Every check-in — resident or walk-in — must present a QR whose encoded
  // plate matches the camera-read plate. Residents use their permanent
  // subscription QR; walk-ins use the ticket from requestEntryQR (minted
  // moments ago at the gate camera).
  if (!qrToken) {
    throw new AppError('Cần quét mã QR (gói đăng ký hoặc vé vào cổng) khớp camera để check-in.', 400);
  }
  const { valid, payload, reason } = verifyQRToken(qrToken);
  if (!valid) throw new AppError(`QR không hợp lệ: ${reason}`, 400);

  if (activeSub) {
    if (payload.type !== 'subscription_entry') {
      throw new AppError('QR không đúng loại (không phải QR gói đăng ký).', 400);
    }
    if (payload.subId !== activeSub._id.toString()) {
      throw new AppError('QR không thuộc gói đăng ký của biển số này.', 400);
    }
    if (payload.plate !== normalizedPlate) {
      throw new AppError(
        `Biển số trên QR (${payload.plate}) không khớp biển số camera (${normalizedPlate}).`,
        400
      );
    }
  } else if (payload.type === 'booking_entry') {
    // Walk-in with a prepaid booking presents the QR from their email.
    if (payload.plate !== normalizedPlate) {
      throw new AppError(
        `Biển số trên QR booking (${payload.plate}) không khớp biển số camera (${normalizedPlate}).`,
        400
      );
    }
    const booking = await Booking.findOne({ _id: payload.bookingId, status: 'paid' }).select('+qrToken');
    if (!booking || booking.qrToken !== qrToken) {
      throw new AppError('QR booking không hợp lệ hoặc không khớp đặt chỗ đã thanh toán.', 400);
    }
    if (booking.expectedExitTime <= new Date()) {
      throw new AppError('Đặt chỗ đã quá giờ ra dự kiến, QR hết hiệu lực.', 400);
    }
  } else {
    if (payload.type !== 'walkin_ticket') {
      throw new AppError('QR không đúng loại (không phải vé vào cổng cho khách vãng lai).', 400);
    }
    if (payload.plate !== normalizedPlate) {
      throw new AppError(
        `Biển số trên vé (${payload.plate}) không khớp biển số camera (${normalizedPlate}).`,
        400
      );
    }
    if (Date.now() - payload.iat > WALKIN_TICKET_TTL_MS) {
      throw new AppError('Vé vào cổng đã hết hạn, vui lòng quét lại biển số để lấy vé mới.', 400);
    }
  }

  const userId = activeSub ? activeSub.userId : null;

  if (vehicleType === 'car') {
    const isResident = !!activeSub;

    // ---- Resident car: fixed reserved slot (the product they paid for) ----
    if (isResident) {
      const resolvedSlotId = activeSub.slotId?.toString();
      if (!resolvedSlotId) {
        throw new AppError('Resident subscription has no slot assigned. Contact admin.', 500);
      }
      if (slotId && slotId !== resolvedSlotId) {
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
      if (slot.floorId.floorType !== 'resident')
        throw new AppError('Resident reserved slot must be on a resident floor.', 400);

      const locked = await ParkingSlot.findOneAndUpdate(
        { _id: resolvedSlotId, status: 'reserved' },
        { status: 'occupied' },
        { new: true }
      );
      if (!locked)
        throw new AppError(
          `Reserved slot is not available for check-in (expected status: reserved, current: ${slot.status})`,
          409
        );

      try {
        const session = await ParkingSession.create({
          slotId: resolvedSlotId,
          rowId: null,
          floorId: null,
          licensePlate: normalizedPlate,
          vehicleType,
          customerType: 'resident',
          subscriptionId: activeSub._id,
          entryTime: new Date(),
          staffId,
          userId,
          status: 'active',
          paymentStatus: 'paid',
          note,
        });
        return attachQR(session, activeSub, qrToken);
      } catch (err) {
        await ParkingSlot.findByIdAndUpdate(resolvedSlotId, { status: 'reserved' });
        throw err;
      }
    }

    // ---- Walk-in car: counter-based on a visitor floor, no fixed slot. ----
    // Capacity = floor.totalSlots; "used" = active car sessions on that floor.
    // Gate check-ins are sequential per staff, so the count-then-create window
    // is acceptable (no IoT/atomic slot to reserve).
    const paidBooking = await bookingService.findPaidBookingForCheckIn(normalizedPlate);

    const visitorFloors = await Floor.find({
      vehicleType: 'car',
      floorType: 'visitor',
      isActive: true,
    })
      .populate({ path: 'buildingId', select: 'isActive' })
      .sort({ floorNumber: 1 });
    if (!visitorFloors.length) throw new AppError('No visitor car floor configured', 500);

    let chosenFloor = null;
    let leastLoadedFloor = null;
    let leastLoadedUsed = Infinity;
    for (const floor of visitorFloors) {
      if (!floor.buildingId?.isActive) continue;
      const used = await ParkingSession.countDocuments({
        floorId: floor._id,
        vehicleType: 'car',
        status: 'active',
      });
      if (used < floor.totalSlots) {
        chosenFloor = floor;
        break;
      }
      if (used < leastLoadedUsed) {
        leastLoadedUsed = used;
        leastLoadedFloor = floor;
      }
    }
    // A paid booking already reserved capacity at creation time (see
    // booking.service.js overlap check), so honor it even if the live count on
    // every visitor floor looks full — walk-ins are what filled the seat it paid for.
    if (!chosenFloor && paidBooking) chosenFloor = leastLoadedFloor;
    if (!chosenFloor)
      throw new AppError('No visitor car capacity available. Parking lot is full.', 409);

    const session = await ParkingSession.create({
      slotId: null,
      rowId: null,
      floorId: chosenFloor._id,
      licensePlate: normalizedPlate,
      vehicleType,
      customerType: 'walk_in',
      bookingId: paidBooking?._id || null,
      prepaidAmount: paidBooking?.amount || 0,
      prepaidHours: paidBooking?.durationHours || 0,
      entryTime: new Date(),
      staffId,
      userId: paidBooking?.userId || null,
      status: 'active',
      paymentStatus: paidBooking ? 'paid' : 'unpaid',
      note,
    });

    if (paidBooking) {
      await bookingService.markUsed(paidBooking._id, session._id);
    }

    return attachQR(session, activeSub, qrToken);
  }

  // Motorcycle: counter-based row. Auto-pick the first row with capacity if
  // staff did not specify one (walk-in -> visitor floor, resident -> resident floor).
  let resolvedRowId = rowId;
  if (!resolvedRowId) {
    const floorType = activeSub ? 'resident' : 'visitor';
    const motoFloors = await Floor.find({
      vehicleType: 'motorcycle',
      floorType,
      isActive: true,
    }).select('_id');
    const autoRow = await ParkingRow.findOne({
      floorId: { $in: motoFloors.map((f) => f._id) },
      status: { $ne: 'maintenance' },
      $expr: { $lt: ['$occupiedCount', '$capacity'] },
    }).sort({ rowCode: 1 });
    if (!autoRow) throw new AppError('No motorcycle capacity available. Parking area is full.', 409);
    resolvedRowId = autoRow._id.toString();
  }

  const row = await ParkingRow.findById(resolvedRowId).populate({
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
    { _id: resolvedRowId, status: { $ne: 'maintenance' }, occupiedCount: { $lt: row.capacity } },
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
      rowId: resolvedRowId,
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
    return attachQR(session, activeSub, qrToken);
  } catch (err) {
    await ParkingRow.findByIdAndUpdate(resolvedRowId, {
      $inc: { occupiedCount: -1 },
      $set: { status: row.status },
    });
    throw err;
  }
};

export const getActiveSessions = async ({ page = 1, limit = 20, vehicleType, licensePlate, floorId, buildingId, status } = {}) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const VALID_STATUSES = ['active', 'completed', 'cancelled'];
  const filter = { status: VALID_STATUSES.includes(status) ? status : 'active' };
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
      { floorId: { $in: floorIds } }, // walk-in cars are linked by floorId directly
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

  const [activeSession, activeSub, lastSession, availableCar, motoAgg, paidBooking] = await Promise.all([
    ParkingSession.findOne({ licensePlate: normalizedPlate, status: 'active' }).populate(SESSION_POPULATE),
    Subscription.findOne({ licensePlate: normalizedPlate, status: 'active' })
      .populate('planId', 'code name vehicleType durationDays price')
      .populate('userId', 'fullName phone email'),
    ParkingSession.findOne({ licensePlate: normalizedPlate, status: { $in: ['completed', 'cancelled'] } })
      .sort({ exitTime: -1 })
      .populate('userId', 'fullName phone email')
      .select('userId entryTime exitTime vehicleType fee'),
    (async () => {
      const visitorFloors = await Floor.find({
        vehicleType: 'car',
        floorType: 'visitor',
        isActive: true,
      }).select('totalSlots');
      const capacity = visitorFloors.reduce((s, f) => s + f.totalSlots, 0);
      const used = await ParkingSession.countDocuments({
        status: 'active',
        vehicleType: 'car',
        floorId: { $in: visitorFloors.map((f) => f._id) },
      });
      return Math.max(0, capacity - used);
    })(),
    ParkingRow.aggregate([
      { $match: { status: 'available' } },
      { $group: { _id: null, available: { $sum: { $subtract: ['$capacity', '$occupiedCount'] } } } },
    ]),
    bookingService.findPaidBookingForCheckIn(normalizedPlate),
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
    booking: paidBooking
      ? {
          _id: paidBooking._id,
          expectedArrivalTime: paidBooking.expectedArrivalTime,
          expectedExitTime: paidBooking.expectedExitTime,
          durationHours: paidBooking.durationHours,
          amount: paidBooking.amount,
          status: paidBooking.status,
        }
      : null,
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
  const session = await ParkingSession.findById(id).select('+qrToken');
  if (!session) throw new AppError('Session not found', 404);
  if (session.status !== 'active')
    throw new AppError(`Session is already ${session.status}`, 400);
  return session;
};

// Applies to every checkout, resident or walk-in: the QR presented must be
// byte-identical to the one we recorded as authoritative for this exact
// visit — residents' permanent subscription QR, or walk-ins' ticket from
// requestEntryQR — and its encoded plate must match what the gate camera
// just read.
const assertExitQRMatches = async (session, qrToken, scannedPlate) => {
  const { valid, payload, reason } = verifyQRToken(qrToken);
  if (!valid) throw new AppError(`QR không hợp lệ: ${reason}`, 400);

  if (payload.type === 'subscription_entry') {
    const sub = session.subscriptionId && await Subscription.findById(session.subscriptionId).select('+qrToken');
    if (!sub || sub.qrToken !== qrToken) {
      throw new AppError('QR gói đăng ký không khớp phiên đỗ xe đang check-out.', 400);
    }
  } else if (payload.type === 'walkin_ticket' || payload.type === 'booking_entry') {
    // Walk-in ticket and booking QR are both stored verbatim on the session.
    if (session.qrToken !== qrToken) {
      throw new AppError('QR không khớp phiên đỗ xe đang check-out.', 400);
    }
  } else {
    throw new AppError('QR không đúng loại để check-out.', 400);
  }

  const normalizedScanned = scannedPlate.toUpperCase().replace(/\s/g, '');
  if (payload.plate !== normalizedScanned) {
    throw new AppError(
      `Biển số camera (${normalizedScanned}) không khớp biển số QR (${payload.plate}).`,
      400
    );
  }
};

const HOUR_MS = 60 * 60 * 1000;

const computeCheckoutFee = async (session, exitTime) => {
  if (session.customerType === 'resident') {
    return {
      total: 0,
      toCollect: 0,
      prepaidAmount: 0,
      prepaidHours: 0,
      overtimeHours: 0,
      overtimeFee: 0,
      breakdown: {},
      pricing: null,
      note: 'Resident with active subscription — no fee',
    };
  }

  if (session.bookingId && session.prepaidHours > 0) {
    // Recompute the full actual stay with current pricing, then collect only
    // the difference beyond what was prepaid at booking time (no refund if early).
    const calc = await pricingService.calculateFee({
      vehicleType: session.vehicleType,
      entryTime: session.entryTime,
      exitTime,
    });
    const overtimeFee = Math.max(0, calc.total - session.prepaidAmount);
    const total = session.prepaidAmount + overtimeFee;

    const actualHours = Math.max(
      1,
      Math.ceil((exitTime.getTime() - new Date(session.entryTime).getTime()) / HOUR_MS)
    );
    const overtimeHours = Math.max(0, actualHours - session.prepaidHours);

    return {
      total,
      toCollect: overtimeFee,
      prepaidAmount: session.prepaidAmount,
      prepaidHours: session.prepaidHours,
      overtimeHours,
      overtimeFee,
      breakdown: {
        ...calc.breakdown,
        prepaidAmount: session.prepaidAmount,
        fullStayFee: calc.total,
      },
      pricing: calc.pricing,
      note: overtimeFee > 0
        ? `Booking prepaid ${session.prepaidAmount}đ, full stay ${calc.total}đ. Collect overtime ${overtimeFee}đ.`
        : 'Booking prepaid covers full stay. Free check-out.',
    };
  }

  const calc = await pricingService.calculateFee({
    vehicleType: session.vehicleType,
    entryTime: session.entryTime,
    exitTime,
  });

  return {
    total: calc.total,
    toCollect: calc.total,
    prepaidAmount: 0,
    prepaidHours: 0,
    overtimeHours: 0,
    overtimeFee: 0,
    breakdown: calc.breakdown,
    pricing: calc.pricing,
    note: 'Walk-in pay-at-exit',
  };
};

export const previewCheckout = async (id) => {
  const session = await loadActiveSession(id);
  const exitTime = new Date();
  const calc = await computeCheckoutFee(session, exitTime);

  return {
    sessionId: session._id,
    customerType: session.customerType,
    bookingId: session.bookingId || null,
    entryTime: session.entryTime,
    exitTime,
    fee: calc.total,
    toCollect: calc.toCollect,
    prepaidAmount: calc.prepaidAmount,
    overtimeHours: calc.overtimeHours,
    overtimeFee: calc.overtimeFee,
    breakdown: calc.breakdown,
    pricing: calc.pricing,
    note: calc.note,
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

export const checkOutCash = async (id, staffId, { qrToken, scannedPlate }) => {
  const session = await loadActiveSession(id);
  await assertExitQRMatches(session, qrToken, scannedPlate);
  const exitTime = new Date();
  const calc = await computeCheckoutFee(session, exitTime);

  return closeSessionPaid(session, {
    method: 'cash',
    exitTime,
    fee: calc.total,
    breakdown: calc.breakdown,
    paidAt: exitTime,
    collectorId: staffId,
  });
};

// Per regulation: lost entry QR → staff verifies the vehicle's papers against
// the plate manually, lets it out, and collects a fixed fine (cash at the gate).
const LOST_QR_PENALTY = 100000;

export const checkOutLostQr = async (id, staffId, { method = 'cash', scannedPlate, note }) => {
  const session = await loadActiveSession(id);

  // Only walk-ins receive a per-visit ticket QR at check-in (car/motorcycle,
  // incl. walk-in car with a booking). Residents use a permanent subscription
  // QR that can simply be re-shown via the QR endpoint — no lost-ticket fine.
  if (session.customerType === 'resident') {
    throw new AppError(
      'Cư dân dùng QR gói cố định (mở lại qua mã QR gói), không áp dụng luồng mất vé vãng lai.',
      400
    );
  }

  // No QR to match: the staff confirmed the vehicle papers match the plate.
  const normalizedScanned = scannedPlate.toUpperCase().replace(/\s/g, '');
  if (session.licensePlate !== normalizedScanned) {
    throw new AppError(
      `Biển số (${normalizedScanned}) không khớp phiên đỗ xe đang check-out (${session.licensePlate}).`,
      400
    );
  }

  const exitTime = new Date();
  const calc = await computeCheckoutFee(session, exitTime);
  // `toCollect` = parking due now (overtime only for prepaid bookings) + fine.
  const toCollect = calc.toCollect + LOST_QR_PENALTY;
  const fee = calc.total + LOST_QR_PENALTY;
  const breakdown = { ...calc.breakdown, lostQrPenalty: LOST_QR_PENALTY };

  const logIncident = () =>
    Incident.create({
      type: 'lost_qr',
      sessionId: session._id,
      licensePlate: session.licensePlate,
      vehicleType: session.vehicleType,
      staffId,
      fineAmount: LOST_QR_PENALTY,
      description:
        note?.trim() ||
        `Khách báo mất QR. Nhân viên đối chiếu giấy tờ xe khớp biển ${session.licensePlate}, cho xuất bãi và thu phạt ${LOST_QR_PENALTY.toLocaleString('vi-VN')}đ (${method}).`,
    });

  // ---- TRANSFER: create a PayOS link (penalty included); session closes on payment ----
  if (method === 'transfer') {
    const existingPending = await Payment.findOne({ sessionId: session._id, status: 'pending' });
    if (existingPending) {
      return {
        session: await session.populate(SESSION_POPULATE),
        payment: {
          orderCode: existingPending.orderCode,
          amount: existingPending.amount,
          checkoutUrl: existingPending.checkoutUrl,
          paymentLinkId: existingPending.paymentLinkId,
          qrCode: existingPending.providerData?.qrCode || null,
        },
        parkingFee: calc.total,
        penalty: LOST_QR_PENALTY,
        fee,
        toCollect,
        breakdown,
        note: 'Đã có link PayOS đang chờ thanh toán cho phiên này — dùng lại link đó.',
      };
    }

    await ParkingSession.findByIdAndUpdate(session._id, {
      paymentMethod: 'transfer',
      paymentStatus: 'pending',
      fee,
      feeBreakdown: breakdown,
      checkOutStaffId: staffId,
    });

    const orderCode = payosService.generateOrderCode();
    const staff = await User.findById(staffId).select('fullName email phone');
    let payosResponse;
    try {
      payosResponse = await payosService.createPaymentLink({
        orderCode,
        amount: toCollect,
        description: `Park ${session.licensePlate}`,
        items: [{ name: `Parking ${session.vehicleType} + phạt mất QR`, quantity: 1, price: toCollect }],
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
      amount: toCollect,
      description: `Park ${session.licensePlate} ${session.vehicleType} (mất QR)`,
      status: 'pending',
      checkoutUrl: payosResponse.checkoutUrl,
      paymentLinkId: payosResponse.paymentLinkId,
      providerData: payosResponse,
    });

    const incident = await logIncident();

    return {
      session: await session.populate(SESSION_POPULATE),
      incident,
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
      parkingFee: calc.total,
      penalty: LOST_QR_PENALTY,
      fee,
      toCollect,
      breakdown,
      note: 'Mất QR — đã đối chiếu giấy tờ. Quét QR PayOS để thanh toán (gồm phạt 100.000đ). Phiên sẽ đóng sau khi thanh toán.',
    };
  }

  // ---- CASH (default): collect at the gate, close immediately ----
  const closed = await closeSessionPaid(session, {
    method: 'cash',
    exitTime,
    fee,
    breakdown,
    paidAt: exitTime,
    collectorId: staffId,
  });
  const incident = await logIncident();

  return {
    session: closed,
    incident,
    payment: null,
    parkingFee: calc.total,
    penalty: LOST_QR_PENALTY,
    fee,
    toCollect,
    breakdown,
    note: 'Check-out không QR (mất QR): đã đối chiếu giấy tờ + thu phạt 100.000đ tiền mặt.',
  };
};

export const checkOutTransfer = async (id, staffId, { qrToken, scannedPlate }) => {
  const session = await loadActiveSession(id);
  await assertExitQRMatches(session, qrToken, scannedPlate);
  const exitTime = new Date();
  const calc = await computeCheckoutFee(session, exitTime);

  if (calc.toCollect === 0) {
    return {
      session: await closeSessionPaid(session, {
        method: 'transfer',
        exitTime,
        fee: calc.total,
        breakdown: calc.breakdown,
        paidAt: exitTime,
        collectorId: staffId,
      }),
      payment: null,
      note: calc.note,
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
      amount: calc.toCollect,
      description: `Park ${session.licensePlate}`,
      items: [{ name: `Parking ${session.vehicleType} overtime`, quantity: 1, price: calc.toCollect }],
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
    amount: calc.toCollect,
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
    toCollect: calc.toCollect,
    breakdown: calc.breakdown,
  };
};

export const getSessionQR = async (id) => {
  const session = await ParkingSession.findById(id).select('+qrToken');
  if (!session) throw new AppError('Session not found', 404);
  if (session.status !== 'active') throw new AppError('QR only available for active sessions', 400);

  let qrToken;
  if (session.subscriptionId) {
    const sub = await Subscription.findById(session.subscriptionId).select('+qrToken');
    qrToken = sub?.qrToken;
  } else {
    qrToken = session.qrToken;
  }
  if (!qrToken) throw new AppError('QR not found for this session. Contact admin.', 500);

  const qrImage = await QRCode.toDataURL(qrToken, { errorCorrectionLevel: 'M', width: 300, margin: 2 });
  return { qrToken, qrImage, licensePlate: session.licensePlate, sessionId: session._id };
};

export const verifyQR = async ({ qrToken, scannedPlate }) => {
  const plate = scannedPlate.toUpperCase().replace(/\s/g, '');

  const { valid, payload, reason } = verifyQRToken(qrToken);
  if (!valid) throw new AppError(`QR không hợp lệ: ${reason}`, 400);

  let session;
  if (payload.type === 'walkin_ticket' || payload.type === 'booking_entry') {
    // The walk-in ticket / booking QR is stored verbatim on the session at
    // check-in — look the session up by that exact token.
    session = await ParkingSession.findOne({ qrToken, status: 'active' }).populate(SESSION_POPULATE);
    if (!session) throw new AppError('Không tìm thấy phiên đỗ xe đang active cho vé này', 404);
  } else if (payload.type === 'subscription_entry') {
    // Residents reuse their permanent QR — find the active session it
    // currently belongs to instead of decoding a session id from the token.
    session = await ParkingSession.findOne({
      subscriptionId: payload.subId,
      status: 'active',
    }).populate(SESSION_POPULATE);
    if (!session) throw new AppError('Không tìm thấy phiên đỗ xe đang active cho QR gói đăng ký này', 404);
  } else {
    throw new AppError('QR không đúng loại để check-out.', 400);
  }

  const plateMatch = payload.plate === plate;

  const preview = await previewCheckout(session._id);
  return {
    session,
    preview,
    plateMatch,
    plateQR: payload.plate,
    plateCamera: plate,
    warning: plateMatch ? null : `Biển số camera (${plate}) khác biển số QR (${payload.plate}). Staff cần xác nhận thủ công.`,
  };
};

export const activateSessionFromWebhook = async (paymentId) => {
  const payment = await Payment.findById(paymentId);
  if (!payment || payment.targetType !== 'session') return null;

  const session = await ParkingSession.findById(payment.sessionId);
  if (!session) {
    console.error('Session missing for paid payment', { paymentId });
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

// Active confirmation for a transfer checkout: query PayOS directly so the
// session closes near-instantly instead of waiting for the webhook.
export const confirmCheckout = async (id) => {
  const session = await ParkingSession.findById(id);
  if (!session) throw new AppError('Session not found', 404);

  if (session.status === 'active' && session.paymentStatus === 'pending') {
    const payment = await Payment.findOne({ sessionId: id }).sort({ createdAt: -1 });
    if (!payment) throw new AppError('No payment found for this session', 404);
    const { confirmPaymentByOrderCode } = await import('./subscription.service.js');
    await confirmPaymentByOrderCode(payment.orderCode);
  }

  return ParkingSession.findById(id).populate(SESSION_POPULATE);
};
