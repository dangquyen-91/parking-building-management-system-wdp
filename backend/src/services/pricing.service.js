import Pricing from '../models/pricing.model.js';
import AppError from '../utils/appError.js';

const HOUR_MS = 60 * 60 * 1000;

export const getActivePricing = async (vehicleType) => {
  const pricing = await Pricing.findOne({ vehicleType, isActive: true });
  if (!pricing) throw new AppError(`No active pricing found for ${vehicleType}`, 500);
  return pricing;
};

const pad2 = (n) => String(n).padStart(2, '0');

// fixed_block: every `blockHours` hours costs `blockFee`, rounded up.
// e.g. 4h -> 35k, 8h -> 70k, 9h -> 105k.
const calcFixedBlock = (durationMs, pricing) => {
  const blockMs = pricing.blockHours * HOUR_MS;
  const blocks = Math.max(1, Math.ceil(durationMs / blockMs));
  const total = blocks * pricing.blockFee;
  return {
    total,
    breakdown: {
      durationMs,
      blocks,
      blockHours: pricing.blockHours,
      blockFee: pricing.blockFee,
      detail: `${blocks} block x ${pricing.blockFee}đ (mỗi ${pricing.blockHours}h)`,
    },
  };
};

// time_block: flat fee for each time-of-day window the stay overlaps,
// recurring per calendar day. e.g. 06-17:5k, 17-22:10k, 22-06:15k.
// Touching a window (even 1 minute) charges its full fee.
const calcTimeBlock = (entry, exit, pricing) => {
  let total = 0;
  const hits = [];

  // Start a day early so overnight windows that began the previous night
  // (e.g. 22:00 -> 06:00) are considered.
  const cursor = new Date(entry.getFullYear(), entry.getMonth(), entry.getDate());
  cursor.setDate(cursor.getDate() - 1);
  const lastDay = new Date(exit.getFullYear(), exit.getMonth(), exit.getDate());

  while (cursor <= lastDay) {
    for (const b of pricing.timeBlocks) {
      const start = new Date(cursor);
      start.setHours(b.startHour, 0, 0, 0);

      const end = new Date(cursor);
      if (b.endHour <= b.startHour) end.setDate(end.getDate() + 1); // overnight wrap
      end.setHours(b.endHour, 0, 0, 0);

      const overlapStart = Math.max(entry.getTime(), start.getTime());
      const overlapEnd = Math.min(exit.getTime(), end.getTime());
      if (overlapStart < overlapEnd) {
        total += b.fee;
        hits.push(`${pad2(b.startHour)}:00-${pad2(b.endHour)}:00=${b.fee}đ`);
      }
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return {
    total,
    breakdown: {
      durationMs: Math.max(0, exit.getTime() - entry.getTime()),
      blocks: hits.length,
      detail: hits.join(', '),
    },
  };
};

export const calculateFee = async ({ vehicleType, entryTime, exitTime }) => {
  const pricing = await getActivePricing(vehicleType);

  const entry = new Date(entryTime);
  const exit = new Date(exitTime);
  const durationMs = Math.max(0, exit.getTime() - entry.getTime());

  let result;
  if (pricing.mode === 'fixed_block') {
    result = calcFixedBlock(durationMs, pricing);
  } else if (pricing.mode === 'time_block') {
    result = calcTimeBlock(entry, exit, pricing);
  } else {
    throw new AppError(`Unsupported pricing mode "${pricing.mode}" for ${vehicleType}`, 500);
  }

  return {
    total: result.total,
    breakdown: result.breakdown,
    pricing: {
      vehicleType: pricing.vehicleType,
      mode: pricing.mode,
      blockHours: pricing.blockHours,
      blockFee: pricing.blockFee,
      timeBlocks: pricing.timeBlocks,
    },
  };
};
