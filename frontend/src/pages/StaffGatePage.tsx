import { useMemo, useState } from 'react'
import {
  INITIAL_TICKETS,
  STAFF_ZONES,
  StaffActiveTickets,
  StaffCheckInPanel,
  StaffCheckOutPanel,
  StaffGateActivity,
  StaffGateSummary,
  type GateMode,
  type ParkingTicket,
  type VisitorType,
} from '../components/staff'

export function StaffGatePage() {
  const [mode, setMode] = useState<GateMode>('checkin')
  const [tickets, setTickets] = useState<ParkingTicket[]>(INITIAL_TICKETS)
  const [plate, setPlate] = useState('')
  const [visitorType, setVisitorType] = useState<VisitorType>('walkIn')
  const [zoneId, setZoneId] = useState<string>(STAFF_ZONES[0].id)
  const [note, setNote] = useState('')
  const [checkoutQuery, setCheckoutQuery] = useState('')

  const activeTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status === 'active'),
    [tickets],
  )
  const completedTickets = tickets.filter((ticket) => ticket.status === 'completed')
  const selectedCheckoutTicket = activeTickets.find((ticket) => {
    const normalizedQuery = checkoutQuery.trim().toLowerCase()

    return (
      normalizedQuery.length > 0 &&
      (ticket.plate.toLowerCase().includes(normalizedQuery) ||
        ticket.id.toLowerCase().includes(normalizedQuery))
    )
  })
  const availableCount = STAFF_ZONES.reduce((total, zone) => total + zone.available, 0) - activeTickets.length

  function handleCreateTicket(ticket: ParkingTicket) {
    setTickets((currentTickets) => [ticket, ...currentTickets])
    setPlate('')
    setNote('')
    setCheckoutQuery(ticket.plate)
    setMode('checkout')
  }

  function handleCheckout(ticketId: string) {
    setTickets((currentTickets) =>
      currentTickets.map((ticket) =>
        ticket.id === ticketId
          ? { ...ticket, status: 'completed', checkOutAt: new Date().toISOString() }
          : ticket,
      ),
    )
    setCheckoutQuery('')
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-subtle">Staff // Gate</p>
          <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Check-in / Checkout</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Man hinh cho nhan vien ghi nhan xe may cua khach vang lai va user tai cong bai do.
          </p>
        </div>

        <StaffGateSummary
          activeCount={activeTickets.length}
          completedCount={completedTickets.length}
          availableCount={Math.max(0, availableCount)}
        />
      </div>

      <div className="mb-5 grid rounded-lg border border-theme bg-badge p-1 sm:inline-grid sm:grid-cols-2">
        {[
          { value: 'checkin', label: 'Xe vao' },
          { value: 'checkout', label: 'Xe ra' },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setMode(item.value as GateMode)}
            className={[
              'h-10 rounded-md px-5 text-sm font-semibold transition-colors',
              mode === item.value
                ? 'bg-btn-primary text-btn-primary-fg'
                : 'text-muted hover:bg-ghost hover:text-fg',
            ].join(' ')}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <div className="grid gap-5">
          {mode === 'checkin' ? (
            <StaffCheckInPanel
              plate={plate}
              visitorType={visitorType}
              zoneId={zoneId}
              note={note}
              onPlateChange={setPlate}
              onVisitorTypeChange={setVisitorType}
              onZoneChange={setZoneId}
              onNoteChange={setNote}
              onCreateTicket={handleCreateTicket}
            />
          ) : (
            <StaffCheckOutPanel
              query={checkoutQuery}
              ticket={selectedCheckoutTicket}
              onQueryChange={setCheckoutQuery}
              onCheckout={handleCheckout}
            />
          )}

          <StaffGateActivity tickets={tickets} />
        </div>

        <StaffActiveTickets
          tickets={activeTickets}
          selectedTicketId={selectedCheckoutTicket?.id}
          onSelectTicket={(ticket) => {
            setCheckoutQuery(ticket.plate)
            setMode('checkout')
          }}
        />
      </div>
    </div>
  )
}
