import { useMemo, useState } from 'react'
import {
  INITIAL_TICKETS,
  StaffPageHeader,
  calculateMotorbikeFee,
  formatGateTime,
  formatStaffCurrency,
  visitorTypeLabel,
} from '../components/staff'

export function StaffVehiclesPage() {
  const [query, setQuery] = useState('')
  const activeTickets = INITIAL_TICKETS.filter((ticket) => ticket.status === 'active')
  const filteredTickets = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) return activeTickets

    return activeTickets.filter((ticket) =>
      [ticket.plate, ticket.id, ticket.slot, ticket.zone].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      ),
    )
  }, [activeTickets, query])

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <StaffPageHeader
        eyebrow="Staff // Vehicles"
        title="Active Vehicles"
        description="Tra cuu nhanh xe dang gui trong bai theo bien so, ma ve, khu hoac vi tri."
        actions={
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Tim bien so / ma ve"
            className="auth-input h-11 w-full rounded-lg border px-3 text-sm font-semibold uppercase text-fg sm:w-80"
          />
        }
      />

      <section className="liquid-glass-card rounded-lg p-4 md:p-5">
        <div className="grid gap-3">
          {filteredTickets.map((ticket) => {
            const estimate = calculateMotorbikeFee(ticket.checkInAt)

            return (
              <article key={ticket.id} className="grid gap-4 rounded-lg border border-theme bg-badge p-4 lg:grid-cols-[1fr_0.9fr_0.9fr_0.9fr] lg:items-center">
                <div>
                  <p className="text-lg font-semibold text-fg">{ticket.plate}</p>
                  <p className="mt-1 text-xs text-subtle">{ticket.id} / {visitorTypeLabel[ticket.visitorType]}</p>
                </div>
                <div>
                  <p className="text-xs text-subtle">Vi tri</p>
                  <p className="mt-1 text-sm font-medium text-fg">{ticket.slot}</p>
                </div>
                <div>
                  <p className="text-xs text-subtle">Gio vao</p>
                  <p className="mt-1 text-sm font-medium text-fg">{formatGateTime(ticket.checkInAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-subtle">Tam tinh</p>
                  <p className="mt-1 text-sm font-medium text-fg">{estimate.hours}h / {formatStaffCurrency(estimate.fee)}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </div>
  )
}

