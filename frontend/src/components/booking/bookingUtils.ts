// Car hourly pricing (mirror of the backend `hourly` pricing config).
// Keep in sync with the active car Pricing doc in the DB.
export const CAR_HOURLY_DAY = 20000
export const CAR_HOURLY_NIGHT = 30000
export const CAR_NIGHT_START = 22 // 22:00
export const CAR_NIGHT_END = 5 //   05:00 (night wraps midnight)
export const CAR_DAILY_CAP = 240000
export const MIN_DURATION_HOURS = 1
export const MAX_DURATION_HOURS = 24

export function toDateTimeLocalValue(date: Date) {
  const offsetMs = date.getTimezoneOffset() * 60 * 1000
  return new Date(date.getTime() - offsetMs).toISOString().slice(0, 16)
}

export function formatBookingCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')} VND`
}

export function formatBookingDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

export function normalizeBookingPlate(value: string) {
  return value.toUpperCase().replace(/\s/g, '')
}

function isNightHour(hour: number) {
  return CAR_NIGHT_START > CAR_NIGHT_END
    ? hour >= CAR_NIGHT_START || hour < CAR_NIGHT_END // wraps midnight (22..5)
    : hour >= CAR_NIGHT_START && hour < CAR_NIGHT_END
}

export type BookingFeeBreakdown = {
  total: number
  dayHours: number
  nightHours: number
  dayFee: number
  nightFee: number
  capped: boolean
}

// Estimate the booking fee: per-hour (rounded up) with a night surcharge for
// hours starting in the night window, capped per 24h. Mirrors backend `hourly`.
export function computeBookingBreakdown(arrival: Date, durationHours: number): BookingFeeBreakdown {
  const hours = Math.max(1, Math.ceil(durationHours))
  let dayHours = 0
  let nightHours = 0
  for (let i = 0; i < hours; i += 1) {
    const hour = new Date(arrival.getTime() + i * 60 * 60 * 1000).getHours()
    if (isNightHour(hour)) nightHours += 1
    else dayHours += 1
  }
  const dayFee = dayHours * CAR_HOURLY_DAY
  const nightFee = nightHours * CAR_HOURLY_NIGHT
  let total = dayFee + nightFee
  let capped = false
  const cap = CAR_DAILY_CAP * Math.ceil(hours / 24)
  if (CAR_DAILY_CAP > 0 && total > cap) {
    total = cap
    capped = true
  }
  return { total, dayHours, nightHours, dayFee, nightFee, capped }
}

export function computeBookingAmount(arrival: Date, durationHours: number) {
  return computeBookingBreakdown(arrival, durationHours).total
}

// Maps raw backend AppError messages (English, from booking.service.js) to
// friendly Vietnamese copy so the booking form never shows a raw API error.
const BOOKING_ERROR_PATTERNS: Array<{ test: RegExp; message: string }> = [
  {
    test: /already has a booking overlapping this time range/i,
    message:
      'Biển số này đã có một đặt chỗ khác trùng khung giờ bạn chọn. Vui lòng chọn khung giờ khác hoặc kiểm tra lại đặt chỗ hiện có của bạn.',
  },
  {
    test: /currently has an active parking session/i,
    message: 'Xe với biển số này đang đỗ trong bãi. Vui lòng đợi xe ra khỏi bãi rồi mới đặt chỗ.',
  },
  {
    test: /expectedArrivalTime must be in the future/i,
    message: 'Giờ đến dự kiến phải ở trong tương lai.',
  },
  {
    test: /can only be made up to 24 hours in advance/i,
    message: 'Chỉ có thể đặt chỗ trước tối đa 24 giờ.',
  },
  {
    test: /expectedExitTime must be after expectedArrivalTime/i,
    message: 'Giờ ra dự kiến phải sau giờ đến dự kiến.',
  },
  {
    test: /duration must be at least/i,
    message: 'Thời lượng đặt chỗ phải ít nhất 1 giờ.',
  },
  {
    test: /duration cannot exceed/i,
    message: 'Thời lượng đặt chỗ không được vượt quá 24 giờ.',
  },
  {
    test: /No availability in the requested time window/i,
    message: 'Bãi xe đã hết chỗ trong khung giờ bạn chọn. Vui lòng chọn khung giờ khác.',
  },
  {
    test: /No visitor car floor configured/i,
    message: 'Hệ thống chưa cấu hình khu đỗ xe cho khách vãng lai. Vui lòng liên hệ quản trị viên.',
  },
]

export function translateBookingError(rawMessage: string): string {
  const matched = BOOKING_ERROR_PATTERNS.find((pattern) => pattern.test.test(rawMessage))
  return matched?.message ?? 'Không thể tạo đặt chỗ. Vui lòng kiểm tra lại thông tin và thử lại.'
}
