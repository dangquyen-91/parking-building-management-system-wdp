export const CAR_BLOCK_HOURS = 4
export const CAR_BLOCK_FEE = 35000
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
  const blocks = Math.max(1, Math.ceil(durationHours / CAR_BLOCK_HOURS))

  return blocks * CAR_BLOCK_FEE
}
