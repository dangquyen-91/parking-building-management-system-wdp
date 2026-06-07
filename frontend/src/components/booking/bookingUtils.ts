export const CAR_BASE_FEE = 20000
export const CAR_DAILY_CAP = 120000
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

export function computeBookingAmount(durationHours: number) {
  const fullDays = Math.floor(durationHours / 24)
  const remainderHours = durationHours - fullDays * 24
  const remainderFee = Math.min(remainderHours * CAR_BASE_FEE, CAR_DAILY_CAP)

  return fullDays * CAR_DAILY_CAP + remainderFee
}
