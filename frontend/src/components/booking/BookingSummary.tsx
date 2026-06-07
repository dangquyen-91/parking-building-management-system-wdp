import { formatBookingCurrency, formatBookingDateTime, normalizeBookingPlate } from './bookingUtils'

type BookingSummaryProps = {
  phoneNumber: string
  licensePlate: string
  expectedArrivalTime: string
  expectedExitTime: string
  durationHours: number
  estimatedFee: number
}

export function BookingSummary({
  phoneNumber,
  licensePlate,
  expectedArrivalTime,
  expectedExitTime,
  durationHours,
  estimatedFee,
}: BookingSummaryProps) {
  return (
    <aside className="liquid-glass-card rounded-lg p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Booking summary</p>
      <h2 className="mt-2 break-all text-xl font-semibold text-fg">
        {normalizeBookingPlate(licensePlate) || 'No plate entered'}
      </h2>
      <p className="mt-1 text-sm text-muted">Visitor car booking</p>

      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Phone</dt>
          <dd className="font-medium text-fg">{phoneNumber.trim() || '-'}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Arrival</dt>
          <dd className="text-right font-medium text-fg">
            {expectedArrivalTime ? formatBookingDateTime(new Date(expectedArrivalTime).toISOString()) : '-'}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Expected exit</dt>
          <dd className="text-right font-medium text-fg">
            {expectedExitTime ? formatBookingDateTime(new Date(expectedExitTime).toISOString()) : '-'}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Duration</dt>
          <dd className="font-medium text-fg">{durationHours} hours</dd>
        </div>
        <div className="border-t border-theme pt-4">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-subtle">Estimated fee</dt>
            <dd className="text-lg font-semibold text-fg">{formatBookingCurrency(estimatedFee)}</dd>
          </div>
        </div>
      </dl>
    </aside>
  )
}
