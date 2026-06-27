import { Link } from 'react-router-dom'
import type { Booking, BookingStatus } from '../../../services/bookingApi'
import { formatBookingCurrency, formatBookingDateTime } from '../bookingUtils'

type BookingDetailPanelProps = {
  booking: Booking
  onCreateAnother: () => void
}

const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  used: 'Đã sử dụng',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
}

export function BookingDetailPanel({ booking, onCreateAnother }: BookingDetailPanelProps) {
  return (
    <aside className="rounded-[1.75rem] border border-violet-100 bg-white/85 p-6 shadow-[0_20px_50px_-35px_rgba(79,70,229,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-violet-500">Chi tiết đặt chỗ</p>
      <h2 className="mt-2 break-all text-2xl font-bold tracking-wide text-fg">{booking.licensePlate}</h2>
      <p className="mt-1 text-sm text-muted">Trạng thái: {BOOKING_STATUS_LABELS[booking.status]}</p>

      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Email</dt>
          <dd className="break-all text-right font-medium text-fg">{booking.email}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Số điện thoại</dt>
          <dd className="font-medium text-fg">{booking.phoneNumber ?? '-'}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Giờ đến</dt>
          <dd className="text-right font-medium text-fg">{formatBookingDateTime(booking.expectedArrivalTime)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Giờ ra</dt>
          <dd className="text-right font-medium text-fg">{formatBookingDateTime(booking.expectedExitTime)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Thời lượng</dt>
          <dd className="font-medium text-fg">{booking.durationHours} giờ</dd>
        </div>
        <div className="border-t border-theme pt-4">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-subtle">Tổng tiền</dt>
            <dd className="text-xl font-bold text-violet-700 dark:text-violet-300">{formatBookingCurrency(booking.amount)}</dd>
          </div>
        </div>
      </dl>

      <button
        type="button"
        className="mt-6 h-11 w-full rounded-xl bg-violet-600 px-4 text-sm font-bold text-white transition hover:bg-violet-700"
        onClick={onCreateAnother}
      >
        Tạo đặt chỗ khác
      </button>
      <Link
        to="/my-bookings"
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-xl border border-theme-strong px-4 text-sm font-bold text-fg transition hover:bg-ghost"
      >
        Xem đặt chỗ của tôi
      </Link>
    </aside>
  )
}
