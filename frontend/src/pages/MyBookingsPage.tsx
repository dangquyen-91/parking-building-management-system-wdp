import { Link } from 'react-router-dom'
import { BrandLink, SkipLink, ThemeToggle } from '../components/common'

const MY_BOOKINGS = [
  {
    id: 'BK-20260529-A01',
    slot: 'A1',
    building: 'Tower A',
    floor: 'B1',
    zone: 'North',
    vehicle: 'Car',
    date: '2026-05-29',
    time: '09:00',
    duration: '2 hours',
    amount: '30.000 VND',
    status: 'Paid',
  },
  {
    id: 'BK-20260530-A03',
    slot: 'A3',
    building: 'Tower A',
    floor: 'B1',
    zone: 'East',
    vehicle: 'Car',
    date: '2026-05-30',
    time: '18:00',
    duration: '3 hours',
    amount: '45.000 VND',
    status: 'Pending',
  },
  {
    id: 'BK-20260601-A01',
    slot: 'A1',
    building: 'Tower A',
    floor: 'B1',
    zone: 'North',
    vehicle: 'Car',
    date: '2026-06-01',
    time: '08:00',
    duration: '1 hour',
    amount: '15.000 VND',
    status: 'Paid',
  },
] as const

const statusClass: Record<(typeof MY_BOOKINGS)[number]['status'], string> = {
  Paid: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  Pending: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
}

export function MyBookingsPage() {
  return (
    <div className="min-h-screen bg-page text-fg">
      <SkipLink />
      <header className="sticky top-0 z-40 border-b border-theme bg-page/95 px-4 backdrop-blur-md md:px-8 lg:px-10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
          <BrandLink className="flex items-center gap-2 text-sm font-medium text-fg hover:text-fg" />
          <nav className="flex items-center gap-2" aria-label="User navigation">
            <Link
              to="/booking"
              className="rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-ghost hover:text-fg"
            >
              Book Slot
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto max-w-7xl p-4 md:p-8 lg:p-10">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-subtle">User // My Bookings</p>
            <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">My Bookings</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              View your fixed frontend booking history. These records are mock data only.
            </p>
          </div>

          <Link
            to="/booking"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-btn-primary px-5 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5"
          >
            New booking
          </Link>
        </div>

        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="hidden grid-cols-[1.1fr_1fr_1fr_0.8fr_0.8fr] gap-4 border-b border-theme px-3 pb-3 text-xs font-medium uppercase tracking-[0.14em] text-subtle lg:grid">
            <span>Booking</span>
            <span>Slot</span>
            <span>Schedule</span>
            <span>Amount</span>
            <span>Status</span>
          </div>

          <div className="divide-y divide-[color:var(--border)]">
            {MY_BOOKINGS.map((booking) => (
              <article
                key={booking.id}
                className="grid gap-4 px-3 py-4 lg:grid-cols-[1.1fr_1fr_1fr_0.8fr_0.8fr] lg:items-center"
              >
                <div>
                  <p className="text-sm font-semibold text-fg">{booking.id}</p>
                  <p className="mt-1 text-xs text-subtle">{booking.building}</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-fg">{booking.slot}</p>
                  <p className="mt-1 text-xs text-subtle">
                    {booking.zone} zone, {booking.floor} - {booking.vehicle}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium text-fg">{booking.date} at {booking.time}</p>
                  <p className="mt-1 text-xs text-subtle">{booking.duration}</p>
                </div>

                <p className="text-sm font-semibold text-fg">{booking.amount}</p>

                <span className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold ${statusClass[booking.status]}`}>
                  {booking.status}
                </span>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
