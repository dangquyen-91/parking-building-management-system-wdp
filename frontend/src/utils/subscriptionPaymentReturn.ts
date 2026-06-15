const STORAGE_KEY = 'subscriptionPaymentReturn'
const MAX_AGE_MS = 2 * 60 * 60 * 1000

type SubscriptionPaymentReturn = {
  orderCode: number
  createdAt: number
}

export function rememberSubscriptionPaymentReturn(orderCode: number) {
  const value: SubscriptionPaymentReturn = {
    orderCode,
    createdAt: Date.now(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export function consumeSubscriptionPaymentReturn(orderCode: string | null) {
  const rawValue = localStorage.getItem(STORAGE_KEY)
  if (!rawValue) return false

  try {
    const value = JSON.parse(rawValue) as SubscriptionPaymentReturn
    const matchesOrder = !orderCode || String(value.orderCode) === orderCode
    const isCurrent = Date.now() - value.createdAt <= MAX_AGE_MS

    if (!matchesOrder || !isCurrent) return false

    localStorage.removeItem(STORAGE_KEY)
    return true
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return false
  }
}
