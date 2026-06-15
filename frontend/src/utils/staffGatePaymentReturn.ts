const STORAGE_KEY = 'staffGatePaymentReturn'
const MAX_AGE_MS = 2 * 60 * 60 * 1000

type StaffGatePaymentReturn = {
  orderCode?: number
  licensePlate: string
  createdAt: number
}

export function rememberStaffGatePaymentReturn(orderCode: number | undefined, licensePlate: string) {
  const value: StaffGatePaymentReturn = {
    orderCode,
    licensePlate,
    createdAt: Date.now(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export function consumeStaffGatePaymentReturn(orderCode: string | null) {
  const rawValue = localStorage.getItem(STORAGE_KEY)
  if (!rawValue) return null

  try {
    const value = JSON.parse(rawValue) as StaffGatePaymentReturn
    const matchesOrder = !orderCode || !value.orderCode || String(value.orderCode) === orderCode
    const isCurrent = Date.now() - value.createdAt <= MAX_AGE_MS

    if (!matchesOrder || !isCurrent || !value.licensePlate) return null

    localStorage.removeItem(STORAGE_KEY)
    return value
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}
