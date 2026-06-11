import ParkingSession from '../models/parking-session.model.js';
import Subscription from '../models/subscription.model.js';
import Booking from '../models/booking.model.js';
import LprLog from '../models/lpr-log.model.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

const LPR_URL = process.env.LPR_SERVICE_URL || 'http://localhost:8000';
const LPR_TIMEOUT_MS = Number(process.env.LPR_TIMEOUT_MS) || 15_000;

export const callLprService = async (imageBuffer, mimeType = 'image/jpeg') => {
  const form = new FormData();
  form.append('image', new Blob([imageBuffer], { type: mimeType }), 'plate.jpg');

  let res;
  try {
    res = await fetch(`${LPR_URL}/recognize`, {
      method: 'POST',
      body: form,
      signal: AbortSignal.timeout(LPR_TIMEOUT_MS),
    });
  } catch (err) {
    logger.error('LPR service unreachable', { url: LPR_URL, error: err.message });
    throw new AppError('License plate recognition service is unavailable', 503);
  }

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    logger.error('LPR service error response', { status: res.status, body });
    throw new AppError('License plate recognition failed', 502);
  }

  return res.json();
};

export const lookupByPlate = async (licensePlate) => {
  const plate = licensePlate.toUpperCase().replace(/\s/g, '');
  const now = new Date();

  const [activeSession, activeSubscription, paidBooking] = await Promise.all([
    ParkingSession.findOne({ licensePlate: plate, status: 'active' })
      .populate({ path: 'slotId', select: 'slotCode vehicleType', populate: { path: 'floorId', select: 'floorNumber' } })
      .populate('rowId', 'rowCode capacity occupiedCount')
      .populate('staffId', 'fullName')
      .lean(),

    Subscription.findOne({ licensePlate: plate, status: 'active' })
      .populate('planId', 'name code vehicleType durationDays')
      .populate({ path: 'slotId', select: 'slotCode', populate: { path: 'floorId', select: 'floorNumber' } })
      .lean(),

    Booking.findOne({
      licensePlate: plate,
      status: 'paid',
      expectedArrivalTime: { $lte: new Date(now.getTime() + 30 * 60 * 1000) },
      expectedExitTime: { $gte: now },
    }).lean(),
  ]);

  return { activeSession, activeSubscription, paidBooking };
};

export const saveScanLog = async ({ lprResult, lookup, staffId }) => {
  try {
    await LprLog.create({
      licensePlate: lprResult.license_plate ?? null,
      confidence: lprResult.confidence ?? 0,
      bbox: lprResult.bbox ?? null,
      processingTimeMs: lprResult.processing_time_ms ?? 0,
      staffId,
      activeSessionId: lookup.activeSession?._id ?? null,
      activeSubscriptionId: lookup.activeSubscription?._id ?? null,
      paidBookingId: lookup.paidBooking?._id ?? null,
    });
  } catch (err) {
    logger.error('Failed to save LPR scan log', { error: err.message });
  }
};

export const getLogs = async ({ page = 1, limit = 20, licensePlate } = {}) => {
  const filter = {};
  if (licensePlate) {
    filter.licensePlate = licensePlate.toUpperCase().replace(/\s/g, '');
  }

  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    LprLog.find(filter)
      .sort({ detectedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('staffId', 'fullName email')
      .lean(),
    LprLog.countDocuments(filter),
  ]);

  return { logs, total, page, limit };
};
