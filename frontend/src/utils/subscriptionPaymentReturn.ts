const STORAGE_KEY = 'subscriptionPaymentReturn'
const MAX_AGE_MS = 2 * 60 * 60 * 1000

type SubscriptionPaymentReturn = {
  orderCode: number
  subscriptionId?: string
  createdAt: number
}

export function rememberSubscriptionPaymentReturn(orderCode: number, subscriptionId?: string) {
  const value: SubscriptionPaymentReturn = {
    orderCode,
    subscriptionId,
    createdAt: Date.now(),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(value))
}

export function consumeSubscriptionPaymentReturn(orderCode: string | null): SubscriptionPaymentReturn | null {
  const rawValue = localStorage.getItem(STORAGE_KEY)
  if (!rawValue) return null

  try {
    const value = JSON.parse(rawValue) as SubscriptionPaymentReturn
    const matchesOrder = !orderCode || String(value.orderCode) === orderCode
    const isCurrent = Date.now() - value.createdAt <= MAX_AGE_MS

    if (!matchesOrder || !isCurrent) return null

    localStorage.removeItem(STORAGE_KEY)
    return value
  } catch {
    localStorage.removeItem(STORAGE_KEY)
    return null
  }
}
