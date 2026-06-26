import type { Subscription, VehicleType } from '../services/userSubscriptionApi'

export const VEHICLE_LABELS: Record<VehicleType, string> = {
  motorcycle: 'Xe máy',
  car: 'Ô tô',
}

export const SUBSCRIPTION_STATUS_LABELS: Record<Subscription['status'], string> = {
  pending: 'Chờ thanh toán',
  active: 'Đang hiệu lực',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
}

export const SUBSCRIPTION_STATUS_TONE: Record<Subscription['status'], string> = {
  pending: 'border-amber-500/80 bg-amber-100 text-amber-900 dark:border-amber-300/70 dark:bg-amber-500/15 dark:text-amber-100',
  active: 'border-emerald-500/70 bg-emerald-100 text-emerald-800 dark:border-emerald-300/70 dark:bg-emerald-500/15 dark:text-emerald-100',
  expired: 'border-theme bg-badge text-subtle',
  cancelled: 'border-rose-500/70 bg-rose-100 text-rose-800 dark:border-rose-300/70 dark:bg-rose-500/15 dark:text-rose-100',
}

export function formatSubscriptionCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')} VND`
}

export function formatSubscriptionDate(value?: string | null) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function normalizePlate(value: string) {
  return value.toUpperCase().replace(/\s/g, '')
}
