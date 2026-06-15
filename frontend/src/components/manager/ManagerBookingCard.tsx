import type { ManagerBooking, ManagerBookingStatus } from '../../services/managerBookingsApi'

const STATUS_LABELS: Record<ManagerBookingStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  used: 'Đã sử dụng',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
}

const STATUS_TONES: Record<ManagerBookingStatus, string> = {
  pending: 'border-amber-500/80 bg-amber-100 text-amber-900 dark:border-amber-300/70 dark:bg-amber-500/15 dark:text-amber-100',
  paid: 'border-emerald-500/70 bg-emerald-100 text-emerald-800 dark:border-emerald-300/70 dark:bg-emerald-500/15 dark:text-emerald-100',
  used: 'border-sky-500/70 bg-sky-100 text-sky-800 dark:border-sky-300/70 dark:bg-sky-500/15 dark:text-sky-100',
  expired: 'border-theme bg-badge text-subtle',
  cancelled: 'border-rose-500/70 bg-rose-100 text-rose-800 dark:border-rose-300/70 dark:bg-rose-500/15 dark:text-rose-100',
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function getCustomerName(booking: ManagerBooking) {
  if (!booking.userId || typeof booking.userId === 'string') return 'Khách chưa đăng nhập'
  return booking.userId.fullName || booking.userId.email || 'Khách hàng'
}

type ManagerBookingCardProps = {
  booking: ManagerBooking
}

export function ManagerBookingCard({ booking }: ManagerBookingCardProps) {
  return (
    <article className="rounded-lg border border-theme bg-badge p-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6 xl:items-center">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold text-fg">{booking.licensePlate}</p>
          <p className="mt-1 truncate text-xs text-subtle">{booking._id}</p>
        </div>
        <div className="min-w-0">
          <p className="text-xs text-subtle">Khách hàng</p>
          <p className="mt-1 truncate font-medium text-fg">{getCustomerName(booking)}</p>
          <p className="mt-1 truncate text-xs text-muted">{booking.phoneNumber}</p>
        </div>
        <div>
          <p className="text-xs text-subtle">Thời gian đến</p>
          <p className="mt-1 font-medium text-fg">{formatDateTime(booking.expectedArrivalTime)}</p>
        </div>
        <div>
          <p className="text-xs text-subtle">Thời gian rời</p>
          <p className="mt-1 font-medium text-fg">{formatDateTime(booking.expectedExitTime)}</p>
          <p className="mt-1 text-xs text-muted">{booking.durationHours} giờ</p>
        </div>
        <div>
          <p className="text-xs text-subtle">Số tiền</p>
          <p className="mt-1 font-medium text-fg">{booking.amount.toLocaleString('vi-VN')} VND</p>
        </div>
        <div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${STATUS_TONES[booking.status]}`}>
            <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
            {STATUS_LABELS[booking.status]}
          </span>
        </div>
      </div>
    </article>
  )
}
