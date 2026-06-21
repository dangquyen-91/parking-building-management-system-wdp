import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookingTopNav, formatBookingCurrency, formatBookingDateTime } from '../../components/booking'
import { AUTH_STORAGE_KEYS } from '../../services/authApi'
import { bookingApi, type Booking, type BookingStatus } from '../../services/bookingApi'

const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  used: 'Đã sử dụng',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
}

const BOOKING_STATUS_TONE: Record<BookingStatus, string> = {
  pending: 'border-amber-500/70 bg-amber-100 text-amber-900 dark:border-amber-300/70 dark:bg-amber-500/15 dark:text-amber-100',
  paid: 'border-emerald-500/70 bg-emerald-100 text-emerald-800 dark:border-emerald-300/70 dark:bg-emerald-500/15 dark:text-emerald-100',
  used: 'border-sky-500/70 bg-sky-100 text-sky-800 dark:border-sky-300/70 dark:bg-sky-500/15 dark:text-sky-100',
  expired: 'border-theme bg-badge text-subtle',
  cancelled: 'border-rose-500/70 bg-rose-100 text-rose-800 dark:border-rose-300/70 dark:bg-rose-500/15 dark:text-rose-100',
}

export function MyBookingsPage() {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(token))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return

    let isActive = true

    bookingApi
      .getMyBookings()
      .then((response) => {
        if (isActive) setBookings(response.bookings ?? [])
      })
      .catch((err: unknown) => {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Không thể tải lịch sử đặt chỗ.')
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [token])

  const stats = useMemo(() => {
    return {
      paid: bookings.filter((booking) => booking.status === 'paid').length,
      pending: bookings.filter((booking) => booking.status === 'pending').length,
      total: bookings.length,
    }
  }, [bookings])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#fafafa_0%,#f5f3ff_52%,#f0f9ff_100%)] text-fg dark:bg-[linear-gradient(145deg,#0f1117_0%,#131122_52%,#0b1720_100%)]">
      <div className="pointer-events-none absolute -left-32 top-28 h-96 w-96 rounded-full bg-violet-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-1/3 h-96 w-96 rounded-full bg-sky-300/10 blur-3xl" />
      <BookingTopNav />

      <main id="main" tabIndex={-1} className="relative z-10 mx-auto max-w-7xl p-4 md:p-8 lg:p-10">
        <section className="relative mb-7 overflow-hidden rounded-[1.75rem] border border-violet-100 bg-white/80 p-6 shadow-[0_20px_50px_-35px_rgba(79,70,229,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 md:p-8">
          <div className="absolute right-0 top-0 h-28 w-28 rounded-bl-full bg-violet-100/60 dark:bg-violet-500/10" />
          <div className="relative flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-500">Không gian cá nhân // Đặt chỗ</p>
            <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Đặt chỗ của tôi</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
              Xem lịch sử đặt chỗ được tạo bằng tài khoản của bạn, bao gồm đơn chờ thanh toán PayOS và đơn đã thanh toán.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center sm:min-w-96">
            <StatBox label="Đã thanh toán" value={stats.paid} tone="border-emerald-200 bg-emerald-50 dark:border-emerald-700/30 dark:bg-emerald-500/10" />
            <StatBox label="Chờ thanh toán" value={stats.pending} tone="border-amber-200 bg-amber-50 dark:border-amber-700/30 dark:bg-amber-500/10" />
            <StatBox label="Tổng đơn" value={stats.total} tone="border-sky-200 bg-sky-50 dark:border-sky-700/30 dark:bg-sky-500/10" />
          </div>
          </div>
        </section>

        {error && (
          <div className="mb-5 rounded-lg border border-rose-500/50 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-100">
            {error}
          </div>
        )}

        <div className="mb-5 flex justify-end">
          <Link
            to="/booking"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
          >
            <span className="text-lg">+</span> Đặt chỗ mới
          </Link>
        </div>

        {!token ? (
          <EmptyState title="Cần đăng nhập" description="Lịch sử đặt chỗ được liên kết với tài khoản của bạn. Hãy đăng nhập để xem các đơn đã tạo." link="/login" action="Đăng nhập" />
        ) : isLoading ? (
          <div className="rounded-2xl border border-violet-200 bg-white/75 p-6 text-sm text-violet-700 shadow-sm backdrop-blur dark:border-violet-700/40 dark:bg-slate-950/60 dark:text-violet-200">
            Đang tải lịch sử đặt chỗ...
          </div>
        ) : bookings.length === 0 ? (
          <EmptyState title="Chưa có đặt chỗ" description="Tạo một đơn đặt chỗ ô tô trả trước, đơn sẽ xuất hiện tại đây sau khi hệ thống lưu vào tài khoản của bạn." link="/booking" action="Tạo đặt chỗ" />
        ) : (
          <section className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-4 shadow-[0_24px_60px_-35px_rgba(30,64,175,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 md:p-5">
            <div className="hidden grid-cols-[1.1fr_1fr_1.1fr_0.8fr_0.8fr] gap-4 border-b border-violet-100 px-4 pb-4 text-xs font-bold uppercase tracking-[0.14em] text-violet-500 dark:border-violet-900/60 dark:text-violet-300 lg:grid">
              <span>Đặt chỗ</span>
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
                  <span className={`absolute inset-y-0 left-0 w-1.5 ${statusStripe(booking.status)}`} />
                  <div>
                    <p className="break-all text-xs font-bold text-violet-700 dark:text-violet-300">#{booking._id.slice(-8).toUpperCase()}</p>
                    <p className="mt-1 text-xs text-subtle">{booking.phoneNumber}</p>
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

                  <p className="text-base font-black text-violet-700 dark:text-violet-300">{formatBookingCurrency(booking.amount)}</p>

                  <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${BOOKING_STATUS_TONE[booking.status]}`}>
                    {BOOKING_STATUS_LABELS[booking.status]}
                  </span>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

type StatBoxProps = {
  label: string
  value: number
  tone: string
}

function StatBox({ label, value, tone }: StatBoxProps) {
  return (
    <div className={`rounded-xl border px-3 py-3 ${tone}`}>
      <p className="text-xl font-bold text-fg">{value}</p>
      <p className="text-[10px] text-subtle">{label}</p>
    </div>
  )
}

function statusStripe(status: BookingStatus) {
  const tones: Record<BookingStatus, string> = {
    pending: 'bg-amber-400',
    paid: 'bg-emerald-500',
    used: 'bg-sky-500',
    expired: 'bg-slate-400',
    cancelled: 'bg-rose-500',
  }
  return tones[status]
}

function EmptyState({ title, description, link, action }: { title: string; description: string; link: string; action: string }) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-9 text-center shadow-[0_24px_60px_-35px_rgba(79,70,229,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-sky-500 text-2xl font-black text-white shadow-lg shadow-violet-500/25">P</div>
      <h2 className="mt-5 text-xl font-bold text-fg">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-muted">{description}</p>
      <Link to={link} className="mt-5 inline-flex h-11 items-center justify-center rounded-xl bg-gradient-to-r from-violet-600 to-sky-500 px-6 text-sm font-bold text-white shadow-lg shadow-violet-500/20">
        {action}
      </Link>
    </section>
  )
}
