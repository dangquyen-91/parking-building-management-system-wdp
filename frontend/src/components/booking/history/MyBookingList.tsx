import type { Booking, BookingStatus } from '../../../services/bookingApi'
import { formatBookingCurrency, formatBookingDateTime } from '../bookingUtils'
import { BookingCredentialQr } from './BookingCredentialQr'

const STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  used: 'Đã sử dụng',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
}

const STATUS_TONES: Record<BookingStatus, string> = {
  pending: 'border-amber-500/70 bg-amber-100 text-amber-900 dark:border-amber-300/70 dark:bg-amber-500/15 dark:text-amber-100',
  paid: 'border-emerald-500/70 bg-emerald-100 text-emerald-800 dark:border-emerald-300/70 dark:bg-emerald-500/15 dark:text-emerald-100',
  used: 'border-sky-500/70 bg-sky-100 text-sky-800 dark:border-sky-300/70 dark:bg-sky-500/15 dark:text-sky-100',
  expired: 'border-theme bg-badge text-subtle',
  cancelled: 'border-rose-500/70 bg-rose-100 text-rose-800 dark:border-rose-300/70 dark:bg-rose-500/15 dark:text-rose-100',
}

const STATUS_STRIPES: Record<BookingStatus, string> = {
  pending: 'bg-amber-400',
  paid: 'bg-emerald-500',
  used: 'bg-sky-500',
  expired: 'bg-slate-400',
  cancelled: 'bg-rose-500',
}

type Props = {
  bookings: Booking[]
  cancellingId?: string | null
  onCancel: (booking: Booking) => void
}

export function MyBookingList({ bookings, cancellingId, onCancel }: Props) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-[0_24px_60px_-35px_rgba(30,64,175,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 md:p-5">
      <div className="hidden grid-cols-[1.1fr_1fr_1.1fr_0.8fr_0.8fr] gap-4 border-b border-violet-100 px-4 pb-4 text-xs font-bold uppercase tracking-[0.14em] text-violet-500 dark:border-violet-900/60 dark:text-violet-300 lg:grid">
        <span>Liên hệ</span><span>Xe</span><span>Lịch</span><span>Số tiền</span><span>Trạng thái</span>
      </div>

      <div className="space-y-3 pt-3">
        {bookings.map((booking) => (
          <article key={booking._id} className="relative overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-r from-white to-slate-50 px-5 py-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:from-white/5 dark:to-white/[0.02]">
            <span className={`absolute inset-y-0 left-0 w-1.5 ${STATUS_STRIPES[booking.status]}`} />
            <div className="grid gap-4 lg:grid-cols-[1.1fr_1fr_1.1fr_0.8fr_0.8fr] lg:items-center">
              <p className="text-sm font-semibold text-fg">{booking.phone}</p>
              <div>
                <p className="text-base font-black tracking-wide text-slate-900 dark:text-white">{booking.licensePlate}</p>
                <p className="mt-1 text-xs text-subtle">Ô tô</p>
              </div>
              <div>
                <p className="text-sm font-medium text-fg">{formatBookingDateTime(booking.expectedArrivalTime)}</p>
                <p className="mt-1 text-xs text-subtle">{booking.durationHours}h, ra lúc {formatBookingDateTime(booking.expectedExitTime)}</p>
              </div>
              <p className="text-base font-black text-violet-700 dark:text-violet-300">{formatBookingCurrency(booking.amount)}</p>
              <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${STATUS_TONES[booking.status]}`}>{STATUS_LABELS[booking.status]}</span>
            </div>

            {(booking.status === 'paid' || booking.status === 'pending') && (
              <div className="mt-4 flex flex-col gap-4 border-t border-slate-200 pt-4 dark:border-white/10">
                {booking.status === 'paid' && booking.qrToken ? (
                  <div className="mx-auto flex flex-col items-center gap-2 text-center">
                    <BookingCredentialQr booking={booking} />
                    <p className="max-w-xs text-xs leading-5 text-subtle">Xuất trình mã này tại cổng khi vào và ra bãi.</p>
                  </div>
                ) : <span />}
                {booking.status === 'pending' && (
                  <button type="button" onClick={() => onCancel(booking)} disabled={cancellingId === booking._id} className="ml-auto inline-flex h-10 items-center justify-center rounded-xl border border-rose-300 bg-rose-50 px-4 text-sm font-bold text-rose-700 transition hover:bg-rose-100 disabled:cursor-wait disabled:opacity-60 dark:border-rose-500/50 dark:bg-rose-500/10 dark:text-rose-200">
                    {cancellingId === booking._id ? 'Đang hủy...' : 'Hủy booking'}
                  </button>
                )}
              </div>
            )}
          </article>
        ))}
      </div>
    </section>
  )
}
