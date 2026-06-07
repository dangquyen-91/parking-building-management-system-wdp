import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { BookingTopNav, formatBookingCurrency, formatBookingDateTime } from '../components/booking'
import { AUTH_STORAGE_KEYS } from '../services/authApi'
import { bookingApi, type Booking, type BookingStatus } from '../services/bookingApi'

const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Pending payment',
  paid: 'Paid',
  used: 'Used',
  expired: 'Expired',
  cancelled: 'Cancelled',
}

const BOOKING_STATUS_TONE: Record<BookingStatus, string> = {
  pending: 'border-amber-500/70 bg-amber-100 text-amber-900 dark:border-amber-300/70 dark:bg-amber-500/15 dark:text-amber-100',
  paid: 'border-emerald-500/70 bg-emerald-100 text-emerald-800 dark:border-emerald-300/70 dark:bg-emerald-500/15 dark:text-emerald-100',
  used: 'border-sky-500/70 bg-sky-100 text-sky-800 dark:border-sky-300/70 dark:bg-sky-500/15 dark:text-sky-100',
  expired: 'border-theme bg-badge text-subtle',
  cancelled: 'border-rose-500/70 bg-rose-100 text-rose-800 dark:border-rose-300/70 dark:bg-rose-500/15 dark:text-rose-100',
}

export function MyBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)

  useEffect(() => {
    if (!token) {
      setIsLoading(false)
      return
    }

    void loadBookings()
  }, [token])

  const stats = useMemo(() => {
    return {
      paid: bookings.filter((booking) => booking.status === 'paid').length,
      pending: bookings.filter((booking) => booking.status === 'pending').length,
      total: bookings.length,
    }
  }, [bookings])

  async function loadBookings() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await bookingApi.getMyBookings()
      setBookings(response.bookings ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cannot load your booking history.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-page text-fg">
      <BookingTopNav />

      <main id="main" tabIndex={-1} className="mx-auto max-w-7xl p-4 md:p-8 lg:p-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-subtle">User // My Bookings</p>
            <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">My Bookings</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              View the real booking history created by your account, including pending PayOS payments and paid bookings.
            </p>
          </div>

          <div className="grid gap-2 text-center sm:min-w-96 sm:grid-cols-3">
            <StatBox label="Paid" value={stats.paid} />
            <StatBox label="Pending" value={stats.pending} />
            <StatBox label="Total" value={stats.total} />
          </div>
        </div>

        {error && (
          <div className="mb-5 rounded-lg border border-rose-500/50 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-100">
            {error}
          </div>
        )}

        <div className="mb-5 flex justify-end">
          <Link
            to="/booking"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-btn-primary px-5 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5"
          >
            New booking
          </Link>
        </div>

        {!token ? (
          <section className="liquid-glass-card rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-fg">Login required</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Your booking history is linked to your account. Login first to view bookings created while authenticated.
            </p>
            <Link
              to="/login"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-btn-primary px-5 text-sm font-semibold text-btn-primary-fg"
            >
              Login
            </Link>
          </section>
        ) : isLoading ? (
          <div className="rounded-lg border border-theme bg-badge p-5 text-sm text-muted">Loading bookings...</div>
        ) : bookings.length === 0 ? (
          <section className="liquid-glass-card rounded-lg p-8 text-center">
            <h2 className="text-xl font-semibold text-fg">No bookings yet</h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-muted">
              Create a prepaid visitor car booking and it will appear here after the backend saves it to your account.
            </p>
            <Link
              to="/booking"
              className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-btn-primary px-5 text-sm font-semibold text-btn-primary-fg"
            >
              Create booking
            </Link>
          </section>
        ) : (
          <section className="liquid-glass-card rounded-lg p-4 md:p-5">
            <div className="hidden grid-cols-[1.1fr_1fr_1.1fr_0.8fr_0.8fr] gap-4 border-b border-theme px-3 pb-3 text-xs font-medium uppercase tracking-[0.14em] text-subtle lg:grid">
              <span>Booking</span>
              <span>Vehicle</span>
              <span>Schedule</span>
              <span>Amount</span>
              <span>Status</span>
            </div>

            <div className="divide-y divide-[color:var(--border)]">
              {bookings.map((booking) => (
                <article
                  key={booking._id}
                  className="grid gap-4 px-3 py-4 lg:grid-cols-[1.1fr_1fr_1.1fr_0.8fr_0.8fr] lg:items-center"
                >
                  <div>
                    <p className="break-all text-sm font-semibold text-fg">{booking._id}</p>
                    <p className="mt-1 text-xs text-subtle">{booking.phoneNumber}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-fg">{booking.licensePlate}</p>
                    <p className="mt-1 text-xs text-subtle">{booking.vehicleType.toUpperCase()}</p>
                  </div>

                  <div>
                    <p className="text-sm font-medium text-fg">{formatBookingDateTime(booking.expectedArrivalTime)}</p>
                    <p className="mt-1 text-xs text-subtle">
                      {booking.durationHours}h, exit {formatBookingDateTime(booking.expectedExitTime)}
                    </p>
                  </div>

                  <p className="text-sm font-semibold text-fg">{formatBookingCurrency(booking.amount)}</p>

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
}

function StatBox({ label, value }: StatBoxProps) {
  return (
    <div className="rounded-lg border border-theme bg-badge px-3 py-2">
      <p className="text-lg font-semibold text-fg">{value}</p>
      <p className="text-[11px] text-subtle">{label}</p>
    </div>
  )
}
