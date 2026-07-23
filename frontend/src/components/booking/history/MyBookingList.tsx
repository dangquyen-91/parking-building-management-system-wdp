import type { Booking, BookingStatus } from '../../../services/bookingApi'
import { formatBookingCurrency, formatBookingDateTime } from '../bookingUtils'

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  used: 'Đã sử dụng',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
}

const STATUS_TONES: Record<BookingStatus, string> = {
  pending:
    'border-amber-500/70 bg-amber-100 text-amber-900 dark:border-amber-300/70 dark:bg-amber-500/15 dark:text-amber-100',
  paid:
    'border-emerald-500/70 bg-emerald-100 text-emerald-800 dark:border-emerald-300/70 dark:bg-emerald-500/15 dark:text-emerald-100',
  used:
    'border-sky-500/70 bg-sky-100 text-sky-800 dark:border-sky-300/70 dark:bg-sky-500/15 dark:text-sky-100',
  expired: 'border-theme bg-badge text-subtle',
  cancelled:
    'border-rose-500/70 bg-rose-100 text-rose-800 dark:border-rose-300/70 dark:bg-rose-500/15 dark:text-rose-100',
}

const STATUS_STRIPES: Record<BookingStatus, string> = {
  pending: 'bg-amber-400',
  paid: 'bg-emerald-500',
  used: 'bg-sky-500',
  expired: 'bg-slate-400',
  cancelled: 'bg-rose-500',
}

export function MyBookingList({ bookings }: { bookings: Booking[] }) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-[0_24px_60px_-35px_rgba(30,64,175,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 md:p-5">
      <div className="hidden grid-cols-[1.1fr_1fr_1.1fr_0.8fr_0.8fr] gap-4 border-b border-violet-100 px-4 pb-4 text-xs font-bold uppercase tracking-[0.14em] text-violet-500 dark:border-violet-900/60 dark:text-violet-300 lg:grid">
        <span>Liên hệ</span>
        <span>Xe</span>
        <span>Lịch</span>
        <span>Số tiền</span>
        <span>Trạng thái</span>
      </div>

      <div className="space-y-3 pt-3">
        {bookings.map((booking) => (
          <article
            key={booking._id}
            className="relative grid gap-4 overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 px-5 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:from-white/5 dark:to-white/[0.02] lg:grid-cols-[1.1fr_1fr_1.1fr_0.8fr_0.8fr] lg:items-center"
          >
            <span className={`absolute inset-y-0 left-0 w-1.5 ${STATUS_STRIPES[booking.status]}`} />
            <div>
              <p className="text-sm font-semibold text-fg">{booking.phone}</p>
            </div>

            <div>
              <p className="text-base font-black tracking-wide text-slate-900 dark:text-white">{booking.licensePlate}</p>
              <p className="mt-1 text-xs text-subtle">Ô tô</p>
            </div>

            <div>
              <p className="text-sm font-medium text-fg">{formatBookingDateTime(booking.expectedArrivalTime)}</p>
              <p className="mt-1 text-xs text-subtle">
                {booking.durationHours}h, ra lúc {formatBookingDateTime(booking.expectedExitTime)}
              </p>
            </div>

            <p className="text-base font-black text-violet-700 dark:text-violet-300">
              {formatBookingCurrency(booking.amount)}
            </p>

            <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_TONES[booking.status]}`}>
              {STATUS_LABELS[booking.status]}
            </span>
          </article>
        ))}
      </div>
    </section>
  )
}
