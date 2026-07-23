type ManagerStatusTone =
  | 'available'
  | 'occupied'
  | 'reserved'
  | 'maintenance'
  | 'full'
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'checkin'
  | 'checkout'
  | 'online'
  | 'break'
  | 'offline'
  | 'active'
  | 'inactive'
  | 'expired'

export const statusTone: Record<ManagerStatusTone, string> = {
  available: 'border-emerald-500/70 bg-emerald-100 text-emerald-800 dark:border-emerald-300/70 dark:bg-emerald-500/15 dark:text-emerald-100',
  occupied: 'border-sky-500/70 bg-sky-100 text-sky-800 dark:border-sky-300/70 dark:bg-sky-500/15 dark:text-sky-100',
  reserved: 'border-amber-500/80 bg-amber-100 text-amber-900 dark:border-amber-300/70 dark:bg-amber-500/15 dark:text-amber-100',
  full: 'border-orange-500/80 bg-orange-100 text-orange-900 dark:border-orange-300/70 dark:bg-orange-500/15 dark:text-orange-100',
  maintenance: 'border-rose-500/70 bg-rose-100 text-rose-800 dark:border-rose-300/70 dark:bg-rose-500/15 dark:text-rose-100',
  confirmed: 'border-emerald-500/70 bg-emerald-100 text-emerald-800 dark:border-emerald-300/70 dark:bg-emerald-500/15 dark:text-emerald-100',
  pending: 'border-amber-500/80 bg-amber-100 text-amber-900 dark:border-amber-300/70 dark:bg-amber-500/15 dark:text-amber-100',
  cancelled: 'border-rose-500/70 bg-rose-100 text-rose-800 dark:border-rose-300/70 dark:bg-rose-500/15 dark:text-rose-100',
  checkin: 'border-sky-500/70 bg-sky-100 text-sky-800 dark:border-sky-300/70 dark:bg-sky-500/15 dark:text-sky-100',
  checkout: 'border-violet-500/70 bg-violet-100 text-violet-800 dark:border-violet-300/70 dark:bg-violet-500/15 dark:text-violet-100',
  online: 'border-emerald-500/70 bg-emerald-100 text-emerald-800 dark:border-emerald-300/70 dark:bg-emerald-500/15 dark:text-emerald-100',
  break: 'border-amber-500/80 bg-amber-100 text-amber-900 dark:border-amber-300/70 dark:bg-amber-500/15 dark:text-amber-100',
  offline: 'border-border bg-card text-muted-foreground',
  active: 'border-emerald-500/70 bg-emerald-100 text-emerald-800 dark:border-emerald-300/70 dark:bg-emerald-500/15 dark:text-emerald-100',
  inactive: 'border-rose-500/70 bg-rose-100 text-rose-800 dark:border-rose-300/70 dark:bg-rose-500/15 dark:text-rose-100',
  expired: 'border-border bg-card text-muted-foreground',
}

export function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')} VND`
}


