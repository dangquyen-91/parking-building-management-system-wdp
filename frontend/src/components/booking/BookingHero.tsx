import { formatBookingCurrency } from './bookingUtils'

type BookingHeroProps = {
  durationHours: number
  estimatedFee: number
}

export function BookingHero({ durationHours, estimatedFee }: BookingHeroProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-subtle">User // Booking</p>
        <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Book Visitor Car Parking</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Create a prepaid car booking by phone, license plate, arrival time, and duration. Backend checks visitor car
          capacity by time window and does not require a selected slot.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center sm:min-w-96">
        <div className="rounded-lg border border-theme bg-badge px-3 py-2">
          <p className="text-lg font-semibold text-fg">Car</p>
          <p className="text-[11px] text-subtle">Vehicle</p>
        </div>
        <div className="rounded-lg border border-theme bg-badge px-3 py-2">
          <p className="text-lg font-semibold text-fg">{durationHours}h</p>
          <p className="text-[11px] text-subtle">Duration</p>
        </div>
        <div className="rounded-lg border border-theme bg-badge px-3 py-2">
          <p className="text-lg font-semibold text-fg">{formatBookingCurrency(estimatedFee)}</p>
          <p className="text-[11px] text-subtle">Estimate</p>
        </div>
      </div>
    </div>
  )
}
