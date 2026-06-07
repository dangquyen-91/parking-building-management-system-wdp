import { useMemo, useState, type FormEvent } from 'react'
import {
  BookingDetailPanel,
  BookingErrorBanner,
  BookingForm,
  BookingHero,
  BookingPaymentPanel,
  BookingSummary,
  BookingTopNav,
  computeBookingAmount,
  normalizeBookingPlate,
  toDateTimeLocalValue,
} from '../components/booking'
import { bookingApi, type Booking, type BookingPayment } from '../services/bookingApi'

export function BookingPage() {
  const defaultArrival = useMemo(() => {
    const nextHour = new Date()
    nextHour.setMinutes(0, 0, 0)
    nextHour.setHours(nextHour.getHours() + 1)
    return toDateTimeLocalValue(nextHour)
  }, [])

  const [phoneNumber, setPhoneNumber] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [expectedArrivalTime, setExpectedArrivalTime] = useState(defaultArrival)
  const [durationHours, setDurationHours] = useState(2)
  const [createdBooking, setCreatedBooking] = useState<Booking | null>(null)
  const [payment, setPayment] = useState<BookingPayment | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const arrival = new Date(expectedArrivalTime)
  const expectedExitTime = Number.isNaN(arrival.getTime())
    ? ''
    : toDateTimeLocalValue(new Date(arrival.getTime() + durationHours * 60 * 60 * 1000))
  const estimatedFee = computeBookingAmount(durationHours)
  const canSubmit =
    phoneNumber.trim().length >= 8 && normalizeBookingPlate(licensePlate).length >= 4 && expectedArrivalTime

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || !expectedExitTime) return

    setIsSubmitting(true)
    setError(null)
    setCreatedBooking(null)
    setPayment(null)

    try {
      const result = await bookingApi.createBooking({
        phoneNumber: phoneNumber.trim(),
        licensePlate: normalizeBookingPlate(licensePlate),
        expectedArrivalTime: new Date(expectedArrivalTime).toISOString(),
        expectedExitTime: new Date(expectedExitTime).toISOString(),
      })

      setCreatedBooking(result.booking)
      setPayment(result.payment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Cannot create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-page text-fg">
      <BookingTopNav />

      <main id="main" tabIndex={-1} className="mx-auto max-w-7xl p-4 md:p-8 lg:p-10">
        <BookingHero durationHours={durationHours} estimatedFee={estimatedFee} />

        {error && <BookingErrorBanner error={error} />}

        {payment && createdBooking ? (
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
            <BookingPaymentPanel payment={payment} />
            <BookingDetailPanel
              booking={createdBooking}
              onCreateAnother={() => {
                setCreatedBooking(null)
                setPayment(null)
              }}
            />
          </div>
        ) : (
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <BookingForm
              phoneNumber={phoneNumber}
              licensePlate={licensePlate}
              expectedArrivalTime={expectedArrivalTime}
              durationHours={durationHours}
              canSubmit={Boolean(canSubmit)}
              isSubmitting={isSubmitting}
              onPhoneNumberChange={setPhoneNumber}
              onLicensePlateChange={setLicensePlate}
              onExpectedArrivalTimeChange={setExpectedArrivalTime}
              onDurationHoursChange={setDurationHours}
              onSubmit={handleSubmit}
            />
            <BookingSummary
              phoneNumber={phoneNumber}
              licensePlate={licensePlate}
              expectedArrivalTime={expectedArrivalTime}
              expectedExitTime={expectedExitTime}
              durationHours={durationHours}
              estimatedFee={estimatedFee}
            />
          </div>
        )}
      </main>
    </div>
  )
}
