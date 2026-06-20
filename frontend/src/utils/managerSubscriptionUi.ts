import type { ManagerSubscription } from '../services/managerSubscriptionsApi'

export function isSubscriptionExpiringSoon(subscription: ManagerSubscription, snapshotTime: number) {
  if (subscription.status !== 'active' || !subscription.endDate) return false
  const remaining = new Date(subscription.endDate).getTime() - snapshotTime
  return remaining >= 0 && remaining <= 7 * 24 * 60 * 60 * 1000
}
