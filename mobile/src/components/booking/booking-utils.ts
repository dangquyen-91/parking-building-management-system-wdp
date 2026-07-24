const HOUR_MS = 60 * 60 * 1000;

export const CAR_HOURLY_DAY = 20000;
export const CAR_HOURLY_NIGHT = 30000;
export const CAR_NIGHT_START = 22;
export const CAR_NIGHT_END = 5;
export const CAR_DAILY_CAP = 240000;

const vnHour = (date: Date) => (date.getUTCHours() + 7) % 24;

const isNightHour = (hour: number) =>
  CAR_NIGHT_START > CAR_NIGHT_END
    ? hour >= CAR_NIGHT_START || hour < CAR_NIGHT_END
    : hour >= CAR_NIGHT_START && hour < CAR_NIGHT_END;

export type BookingFeeBreakdown = {
  total: number;
  dayHours: number;
  nightHours: number;
  dayFee: number;
  nightFee: number;
  capped: boolean;
};

export function computeBookingBreakdown(
  arrivalTime: Date,
  durationHours: number,
): BookingFeeBreakdown {
  const totalHours = Math.max(1, Math.ceil(durationHours));
  let dayHours = 0;
  let nightHours = 0;

  for (let i = 0; i < totalHours; i += 1) {
    const hour = vnHour(new Date(arrivalTime.getTime() + i * HOUR_MS));
    if (isNightHour(hour)) {
      nightHours += 1;
    } else {
      dayHours += 1;
    }
  }

  const dayFee = dayHours * CAR_HOURLY_DAY;
  const nightFee = nightHours * CAR_HOURLY_NIGHT;
  const cap = CAR_DAILY_CAP * Math.ceil(totalHours / 24);
  const rawTotal = dayFee + nightFee;
  const capped = CAR_DAILY_CAP > 0 && rawTotal > cap;

  return {
    total: capped ? cap : rawTotal,
    dayHours,
    nightHours,
    dayFee,
    nightFee,
    capped,
  };
}

export function computeBookingAmount(arrivalTime: Date, durationHours: number) {
  return computeBookingBreakdown(arrivalTime, durationHours).total;
}
