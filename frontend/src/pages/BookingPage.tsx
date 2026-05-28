import { useMemo, useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BrandLink, SkipLink, ThemeToggle } from '../components/common'

type SlotStatus = 'available' | 'busy' | 'reserved'

type ParkingSlot = {
  id: string
  code: string
  floor: string
  zone: string
  type: 'Car' | 'Motorbike' | 'EV'
  status: SlotStatus
  distance: string
}

const BUILDINGS = ['Tower A', 'Tower B', 'Tower C']
const FLOORS = ['B1', 'B2', 'B3']
const VEHICLE_TYPES = ['Car', 'Motorbike', 'EV'] as const
const TIMES = ['08:00', '09:00', '10:00', '13:00', '15:00', '18:00', '20:00']
const QR_CELLS = [
  1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1,
  1, 0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1,
  1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1,
  1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0,
  1, 1, 1, 1, 1, 0, 0, 1, 1, 1, 0, 1,
  0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0,
  1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1,
  0, 1, 0, 0, 1, 0, 1, 1, 1, 0, 0, 1,
  1, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 0,
  1, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1,
  1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0,
  0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1,
]

const PARKING_SLOTS: ParkingSlot[] = [
  { id: 'a-b1-01', code: 'A1', floor: 'B1', zone: 'North', type: 'Car', status: 'available', distance: '32 m' },
  { id: 'a-b1-02', code: 'A2', floor: 'B1', zone: 'North', type: 'Car', status: 'busy', distance: '35 m' },
  { id: 'a-b1-03', code: 'A3', floor: 'B1', zone: 'East', type: 'Car', status: 'available', distance: '42 m' },
  { id: 'a-b1-04', code: 'A4', floor: 'B1', zone: 'East', type: 'Car', status: 'reserved', distance: '46 m' },
]

const statusLabel: Record<SlotStatus, string> = {
  available: 'Available',
  busy: 'Occupied',
  reserved: 'Reserved',
}

const statusClass: Record<SlotStatus, string> = {
  available: 'border-emerald-400/45 bg-emerald-500/10 text-emerald-200',
  busy: 'border-rose-400/35 bg-rose-500/10 text-rose-200',
  reserved: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">{children}</label>
}

export function BookingPage() {
  const [building, setBuilding] = useState(BUILDINGS[0])
  const [floor, setFloor] = useState(FLOORS[0])
  const [vehicleType, setVehicleType] = useState<(typeof VEHICLE_TYPES)[number]>('Car')
  const [date, setDate] = useState('2026-05-29')
  const [time, setTime] = useState(TIMES[1])
  const [duration, setDuration] = useState(2)
  const [selectedSlotId, setSelectedSlotId] = useState('a-b1-01')
  const [step, setStep] = useState<'booking' | 'payment'>('booking')
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'success'>('pending')

  const visibleSlots = useMemo(
    () => PARKING_SLOTS.filter((slot) => slot.floor === floor && slot.type === vehicleType),
    [floor, vehicleType],
  )

  const selectedSlot = visibleSlots.find((slot) => slot.id === selectedSlotId)
  const availableCount = PARKING_SLOTS.filter((slot) => slot.status === 'available').length
  const estimatedFee = duration * (vehicleType === 'Motorbike' ? 8000 : vehicleType === 'EV' ? 22000 : 15000)
  const paymentCode = selectedSlot
    ? `PK-${selectedSlot.code}-${date.replaceAll('-', '')}-${time.replace(':', '')}`
    : 'PK-PENDING'

  return (
    <div className="min-h-screen bg-page text-fg">
      <SkipLink />
      <header className="sticky top-0 z-40 border-b border-theme bg-page/95 px-4 backdrop-blur-md md:px-8 lg:px-10">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4">
          <BrandLink className="flex items-center gap-2 text-sm font-medium text-fg hover:text-fg" />
          <nav className="flex items-center gap-2" aria-label="User navigation">
            <Link
              to="/"
              className="hidden rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-ghost hover:text-fg sm:inline-flex"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="hidden rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-ghost hover:text-fg sm:inline-flex"
            >
              Login
            </Link>
            <Link
              to="/my-bookings"
              className="hidden rounded-lg px-3 py-2 text-xs text-muted transition-colors hover:bg-ghost hover:text-fg sm:inline-flex"
            >
              My bookings
            </Link>
            <ThemeToggle />
          </nav>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="mx-auto max-w-7xl p-4 md:p-8 lg:p-10">
      {step === 'payment' && selectedSlot ? (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_24rem]">
          <section className="liquid-glass-card rounded-lg p-5 md:p-7">
            <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-subtle">Payment // QR Code</p>
            <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Scan to Pay</h1>
            <p className="mt-3 max-w-2xl text-sm text-muted">
              This is a fixed frontend payment preview. Use the button below to simulate a completed QR payment.
            </p>

            {paymentStatus === 'success' && (
              <div className="mt-5 rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-200">
                Thanh toán thành công
              </div>
            )}

            <div className="mt-8 grid gap-6 md:grid-cols-[18rem_minmax(0,1fr)]">
              <div className="rounded-lg border border-theme bg-white p-5 text-black">
                <div className="grid aspect-square grid-cols-12 gap-1">
                  {QR_CELLS.map((cell, index) => (
                    <span
                      key={index}
                      className={cell ? 'rounded-[2px] bg-black' : 'rounded-[2px] bg-white'}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <p className="mt-4 text-center text-xs font-semibold tracking-[0.18em]">{paymentCode}</p>
              </div>

              <div className="flex flex-col justify-between gap-5 rounded-lg border border-theme bg-badge p-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-subtle">Transfer content</p>
                  <p className="mt-2 break-all rounded-lg border border-theme bg-page px-3 py-3 text-sm font-semibold text-fg">
                    {paymentCode}
                  </p>
                </div>

                <dl className="grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-subtle">Bank</dt>
                    <dd className="mt-1 font-medium text-fg">Parking Simulator Bank</dd>
                  </div>
                  <div>
                    <dt className="text-subtle">Account</dt>
                    <dd className="mt-1 font-medium text-fg">0123 456 789</dd>
                  </div>
                  <div>
                    <dt className="text-subtle">Receiver</dt>
                    <dd className="mt-1 font-medium text-fg">PARKING BUILDING</dd>
                  </div>
                  <div>
                    <dt className="text-subtle">Amount</dt>
                    <dd className="mt-1 font-medium text-fg">{estimatedFee.toLocaleString('vi-VN')} VND</dd>
                  </div>
                </dl>

                <button
                  type="button"
                  className="h-11 rounded-lg border border-theme-strong px-4 text-sm font-semibold text-fg transition-colors hover:bg-ghost"
                  onClick={() => setStep('booking')}
                >
                  Back to booking
                </button>
                <button
                  type="button"
                  className="h-11 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5"
                  onClick={() => setPaymentStatus('success')}
                >
                  Simulate QR paid
                </button>
                {paymentStatus === 'success' && (
                  <Link
                    to="/my-bookings"
                    className="inline-flex h-11 items-center justify-center rounded-lg border border-theme-strong px-4 text-sm font-semibold text-fg transition-colors hover:bg-ghost"
                  >
                    View my bookings
                  </Link>
                )}
              </div>
            </div>
          </section>

          <aside className="liquid-glass-card rounded-lg p-5">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Booking detail</p>
            <h2 className="mt-2 text-xl font-semibold text-fg">{selectedSlot.code}</h2>
            <p className="mt-1 text-sm text-muted">{selectedSlot.zone} zone, {floor}</p>

            <dl className="mt-6 space-y-4 text-sm">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-subtle">Building</dt>
                <dd className="font-medium text-fg">{building}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-subtle">Schedule</dt>
                <dd className="font-medium text-fg">{date} at {time}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-subtle">Vehicle</dt>
                <dd className="font-medium text-fg">{vehicleType}</dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-subtle">Duration</dt>
                <dd className="font-medium text-fg">{duration} hours</dd>
              </div>
              <div className="border-t border-theme pt-4">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-subtle">Total</dt>
                  <dd className="text-lg font-semibold text-fg">{estimatedFee.toLocaleString('vi-VN')} VND</dd>
                </div>
              </div>
            </dl>
          </aside>
        </div>
      ) : (
      <>
      <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-subtle">User // Booking</p>
          <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Book a Parking Slot</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Pick a building, schedule, vehicle type, and parking slot. This screen uses fixed frontend data only.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center sm:min-w-96">
          <div className="rounded-lg border border-theme bg-badge px-3 py-2">
            <p className="text-lg font-semibold text-fg">{availableCount}</p>
            <p className="text-[11px] text-subtle">Available</p>
          </div>
          <div className="rounded-lg border border-theme bg-badge px-3 py-2">
            <p className="text-lg font-semibold text-fg">{PARKING_SLOTS.length}</p>
            <p className="text-[11px] text-subtle">Total slots</p>
          </div>
          <div className="rounded-lg border border-theme bg-badge px-3 py-2">
            <p className="text-lg font-semibold text-fg">{duration}h</p>
            <p className="text-[11px] text-subtle">Duration</p>
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="flex flex-col gap-2">
              <FieldLabel>Building</FieldLabel>
              <select
                value={building}
                onChange={(event) => setBuilding(event.target.value)}
                className="auth-input h-11 rounded-lg border px-3 text-sm text-fg"
              >
                {BUILDINGS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel>Floor</FieldLabel>
              <select
                value={floor}
                onChange={(event) => {
                  setFloor(event.target.value)
                  const nextSlot = PARKING_SLOTS.find(
                    (slot) => slot.floor === event.target.value && slot.type === vehicleType && slot.status === 'available',
                  )
                  setSelectedSlotId(nextSlot?.id ?? '')
                }}
                className="auth-input h-11 rounded-lg border px-3 text-sm text-fg"
              >
                {FLOORS.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel>Date</FieldLabel>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="auth-input h-11 rounded-lg border px-3 text-sm text-fg"
              />
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel>Start time</FieldLabel>
              <select
                value={time}
                onChange={(event) => setTime(event.target.value)}
                className="auth-input h-11 rounded-lg border px-3 text-sm text-fg"
              >
                {TIMES.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_16rem]">
            <div>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-base font-semibold text-fg">Vehicle type</h2>
                <span className="text-xs text-subtle">{building}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {VEHICLE_TYPES.map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => {
                      setVehicleType(type)
                      const nextSlot = PARKING_SLOTS.find(
                        (slot) => slot.floor === floor && slot.type === type && slot.status === 'available',
                      )
                      setSelectedSlotId(nextSlot?.id ?? '')
                    }}
                    className={[
                      'h-12 rounded-lg border px-4 text-left text-sm font-medium transition-colors',
                      vehicleType === type
                        ? 'border-theme-strong bg-btn-primary text-btn-primary-fg'
                        : 'border-theme bg-badge text-muted hover:bg-ghost hover:text-fg',
                    ].join(' ')}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <FieldLabel>Duration</FieldLabel>
              <div className="flex h-12 items-center rounded-lg border border-theme bg-badge px-2">
                <button
                  type="button"
                  className="h-8 w-8 rounded-md text-muted hover:bg-ghost hover:text-fg"
                  onClick={() => setDuration((value) => Math.max(1, value - 1))}
                  aria-label="Decrease duration"
                >
                  -
                </button>
                <span className="flex-1 text-center text-sm font-semibold text-fg">{duration} hours</span>
                <button
                  type="button"
                  className="h-8 w-8 rounded-md text-muted hover:bg-ghost hover:text-fg"
                  onClick={() => setDuration((value) => Math.min(12, value + 1))}
                  aria-label="Increase duration"
                >
                  +
                </button>
              </div>
            </div>
          </div>

          <div className="mt-7">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-fg">Slot map</h2>
                <p className="text-xs text-subtle">Showing {vehicleType.toLowerCase()} slots on {floor}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-[11px] text-subtle">
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-400" />Available</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-300" />Reserved</span>
                <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-rose-400" />Occupied</span>
              </div>
            </div>

            {visibleSlots.length > 0 ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {visibleSlots.map((slot) => {
                  const isSelected = selectedSlotId === slot.id
                  const disabled = slot.status !== 'available'

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => setSelectedSlotId(slot.id)}
                      className={[
                        'min-h-28 rounded-lg border p-4 text-left transition-all disabled:cursor-not-allowed disabled:opacity-60',
                        isSelected
                          ? 'border-theme-strong bg-btn-primary text-btn-primary-fg shadow-lg shadow-black/10'
                          : `${statusClass[slot.status]} hover:-translate-y-0.5`,
                      ].join(' ')}
                    >
                      <span className="flex items-start justify-between gap-3">
                        <span>
                          <span className="block text-lg font-semibold">{slot.code}</span>
                          <span className="mt-1 block text-xs opacity-75">{slot.zone} zone</span>
                        </span>
                        <span className="rounded-full border border-current px-2 py-1 text-[10px] font-medium uppercase tracking-wide opacity-80">
                          {statusLabel[slot.status]}
                        </span>
                      </span>
                      <span className="mt-5 flex items-center justify-between text-xs opacity-75">
                        <span>{slot.type}</span>
                        <span>{slot.distance} to lobby</span>
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="rounded-lg border border-theme bg-badge p-6 text-sm text-muted">
                No fixed slot data matches this floor and vehicle type yet.
              </div>
            )}
          </div>
        </section>

        <aside className="liquid-glass-card rounded-lg p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Booking summary</p>
          <h2 className="mt-2 text-xl font-semibold text-fg">{selectedSlot?.code ?? 'No slot selected'}</h2>
          <p className="mt-1 text-sm text-muted">{selectedSlot ? `${selectedSlot.zone} zone, ${floor}` : 'Choose an available slot'}</p>

          <dl className="mt-6 space-y-4 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-subtle">Building</dt>
              <dd className="font-medium text-fg">{building}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-subtle">Schedule</dt>
              <dd className="font-medium text-fg">{date} at {time}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-subtle">Vehicle</dt>
              <dd className="font-medium text-fg">{vehicleType}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-subtle">Duration</dt>
              <dd className="font-medium text-fg">{duration} hours</dd>
            </div>
            <div className="border-t border-theme pt-4">
              <div className="flex items-center justify-between gap-4">
                <dt className="text-subtle">Estimated fee</dt>
                <dd className="text-lg font-semibold text-fg">{estimatedFee.toLocaleString('vi-VN')} VND</dd>
              </div>
            </div>
          </dl>

          <button
            type="button"
            disabled={!selectedSlot}
            onClick={() => {
              setPaymentStatus('pending')
              setStep('payment')
            }}
            className="mt-6 h-11 w-full rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Confirm booking
          </button>
          <p className="mt-3 text-center text-xs text-subtle">Static preview only. No API request will be sent.</p>
        </aside>
      </div>
      </>
      )}
      </main>
    </div>
  )
}
