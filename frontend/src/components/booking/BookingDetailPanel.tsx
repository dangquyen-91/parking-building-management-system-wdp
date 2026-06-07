import { Link } from 'react-router-dom'
import type { Booking } from '../../services/bookingApi'
import { formatBookingCurrency, formatBookingDateTime } from './bookingUtils'

type BookingDetailPanelProps = {
  booking: Booking
  onCreateAnother: () => void
}

export function BookingDetailPanel({ booking, onCreateAnother }: BookingDetailPanelProps) {
  return (
    <aside className="liquid-glass-card rounded-lg p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Booking detail</p>
      <h2 className="mt-2 break-all text-xl font-semibold text-fg">{booking.licensePlate}</h2>
      <p className="mt-1 text-sm text-muted">Status: {booking.status}</p>

      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Phone</dt>
          <dd className="font-medium text-fg">{booking.phoneNumber}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Arrival</dt>
          <dd className="text-right font-medium text-fg">{formatBookingDateTime(booking.expectedArrivalTime)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Exit</dt>
          <dd className="text-right font-medium text-fg">{formatBookingDateTime(booking.expectedExitTime)}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Duration</dt>
          <dd className="font-medium text-fg">{booking.durationHours} hours</dd>
        </div>
        <div className="border-t border-theme pt-4">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-subtle">Total</dt>
            <dd className="text-lg font-semibold text-fg">{formatBookingCurrency(booking.amount)}</dd>
          </div>
        </div>
      </dl>

      <button
        type="button"
        className="mt-6 h-11 w-full rounded-lg border border-theme-strong px-4 text-sm font-semibold text-fg transition-colors hover:bg-ghost"
        onClick={onCreateAnother}
      >
        Create another booking
      </button>
      <Link
        to="/my-bookings"
        className="mt-3 inline-flex h-11 w-full items-center justify-center rounded-lg border border-theme-strong px-4 text-sm font-semibold text-fg transition-colors hover:bg-ghost"
      >
        View my bookings
      </Link>
    </aside>
  )
}
