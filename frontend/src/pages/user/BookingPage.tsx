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
} from '../../components/booking'
import { getStoredAuthUser } from '../../services/authApi'
import { bookingApi, type Booking, type BookingPayment } from '../../services/bookingApi'
import { isValidEmail, isValidLicensePlate, isValidVNPhone } from '../../utils/validation'

export function BookingPage() {
  const storedUser = useMemo(() => getStoredAuthUser(), [])
  const defaultArrival = useMemo(() => {
    const nextHour = new Date()
    nextHour.setMinutes(0, 0, 0)
    nextHour.setHours(nextHour.getHours() + 1)
    return toDateTimeLocalValue(nextHour)
  }, [])

  const [email, setEmail] = useState(storedUser?.email ?? '')
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
  const estimatedFee = Number.isNaN(arrival.getTime()) ? 0 : computeBookingAmount(arrival, durationHours)
  const canSubmit =
    isValidEmail(email) &&
    isValidVNPhone(phoneNumber) &&
    isValidLicensePlate(licensePlate) &&
    Boolean(expectedArrivalTime)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!canSubmit || !expectedExitTime) return

    setIsSubmitting(true)
    setError(null)
    setCreatedBooking(null)
    setPayment(null)

    try {
      const result = await bookingApi.createBooking({
        email: email.trim().toLowerCase(),
        phone: phoneNumber.trim(),
        licensePlate: normalizeBookingPlate(licensePlate),
        expectedArrivalTime: new Date(expectedArrivalTime).toISOString(),
        expectedExitTime: new Date(expectedExitTime).toISOString(),
      })

      setCreatedBooking(result.booking)
      setPayment(result.payment)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tạo đặt chỗ. Vui lòng thử lại.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#fafafa_0%,#f5f3ff_52%,#f0f9ff_100%)] text-fg dark:bg-[linear-gradient(145deg,#0f1117_0%,#131122_52%,#0b1720_100%)]">
      <div className="pointer-events-none absolute left-[-8rem] top-24 h-80 w-80 rounded-full bg-violet-300/10 blur-3xl" />
      <div className="pointer-events-none absolute right-[-7rem] top-56 h-96 w-96 rounded-full bg-sky-300/10 blur-3xl" />
      <BookingTopNav />

      <main id="main" tabIndex={-1} className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-24 md:px-8 md:pb-10 lg:px-10">
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
              email={email}
              phoneNumber={phoneNumber}
              licensePlate={licensePlate}
              expectedArrivalTime={expectedArrivalTime}
              durationHours={durationHours}
              canSubmit={Boolean(canSubmit)}
              isSubmitting={isSubmitting}
              isEmailLocked={Boolean(storedUser?.email)}
              onEmailChange={setEmail}
              onPhoneNumberChange={setPhoneNumber}
              onLicensePlateChange={setLicensePlate}
              onExpectedArrivalTimeChange={setExpectedArrivalTime}
              onDurationHoursChange={setDurationHours}
              onSubmit={handleSubmit}
            />
            <BookingSummary
              email={email}
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
