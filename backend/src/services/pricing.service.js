import Pricing from '../models/pricing.model.js';
import AppError from '../utils/appError.js';

const HOUR_MS = 60 * 60 * 1000;
const DAY_MS = 24 * HOUR_MS;

const countNights = (entry, exit, startHour, endHour) => {
  let nights = 0;
  const cursor = new Date(entry.getFullYear(), entry.getMonth(), entry.getDate());
  cursor.setDate(cursor.getDate() - 1);
  const lastDay = new Date(exit.getFullYear(), exit.getMonth(), exit.getDate());

  while (cursor <= lastDay) {
    const nightStart = new Date(cursor);
    nightStart.setHours(startHour, 0, 0, 0);

    const nightEnd = new Date(cursor);
    nightEnd.setDate(nightEnd.getDate() + 1);
    nightEnd.setHours(endHour, 0, 0, 0);

    if (Math.max(entry.getTime(), nightStart.getTime()) < Math.min(exit.getTime(), nightEnd.getTime())) {
      nights++;
    }

    cursor.setDate(cursor.getDate() + 1);
  }
  return nights;
};

export const getActivePricing = async (vehicleType) => {
  const pricing = await Pricing.findOne({ vehicleType, isActive: true });
  if (!pricing) throw new AppError(`No active pricing found for ${vehicleType}`, 500);
  return pricing;
};

export const calculateFee = async ({ vehicleType, entryTime, exitTime }) => {
  const pricing = await getActivePricing(vehicleType);

  const entry = new Date(entryTime);
  const exit = new Date(exitTime);
  const durationMs = Math.max(0, exit.getTime() - entry.getTime());

  let baseFee = 0;
  let turns = 0;
  let hours = 0;
  let cappedAt = null;

  if (pricing.baseUnit === 'turn') {
    turns = Math.max(1, Math.ceil(durationMs / DAY_MS));
    baseFee = turns * pricing.baseFee;
  } else {
    let remainingMs = durationMs;
    let totalHours = 0;
    while (remainingMs > 0) {
      const blockMs = Math.min(remainingMs, DAY_MS);
      const blockHours = Math.max(1, Math.ceil(blockMs / HOUR_MS));
      let blockFee = blockHours * pricing.baseFee;
      if (pricing.dailyCap !== null && blockFee > pricing.dailyCap) {
        blockFee = pricing.dailyCap;
        cappedAt = pricing.dailyCap;
      }
      baseFee += blockFee;
      totalHours += blockHours;
      remainingMs -= blockMs;
    }
    hours = totalHours;
  }

  const nights = countNights(entry, exit, pricing.overnightStartHour, pricing.overnightEndHour);
  const overnightFee = nights * pricing.overnightFee;

  const total = baseFee + overnightFee;

  return {
    total,
    breakdown: {
      durationMs,
      turns,
      hours,
      nights,
      baseFee,
      overnightFee,
      cappedAt,
    },
    pricing: {
      vehicleType: pricing.vehicleType,
      baseFee: pricing.baseFee,
      baseUnit: pricing.baseUnit,
      overnightFee: pricing.overnightFee,
      dailyCap: pricing.dailyCap,
    },
  };
};
