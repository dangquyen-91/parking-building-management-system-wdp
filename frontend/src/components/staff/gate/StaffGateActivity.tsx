import { formatGateTime, visitorTypeLabel, type ParkingTicket } from '../data/staffGateData'

type StaffGateActivityProps = {
  tickets: ParkingTicket[]
}

export function StaffGateActivity({ tickets }: StaffGateActivityProps) {
  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Log ca trực</p>
        <h2 className="mt-1 text-base font-semibold text-fg">Hoạt động gần đây</h2>
      </div>

      <div className="overflow-hidden rounded-lg border border-theme">
        <div className="hidden grid-cols-[1fr_0.8fr_0.8fr_0.8fr] gap-4 border-b border-theme bg-badge px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-subtle md:grid">
          <span>Xe</span>
          <span>Loại khách</span>
          <span>Vị trí</span>
          <span>Trạng thái</span>
        </div>

        <div className="divide-y divide-[color:var(--border)]">
          {tickets.slice(0, 6).map((ticket) => (
            <div key={ticket.id} className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr]">
              <div>
                <p className="font-semibold text-fg">{ticket.plate}</p>
                <p className="mt-1 text-xs text-subtle">{ticket.id}</p>
              </div>
              <p className="text-muted">{visitorTypeLabel[ticket.visitorType]}</p>
              <p className="text-muted">{ticket.slot}</p>
              <p className={ticket.status === 'active' ? 'text-emerald-300' : 'text-subtle'}>
                {ticket.status === 'active'
                  ? `Vào ${formatGateTime(ticket.checkInAt)}`
                  : `Ra ${ticket.checkOutAt ? formatGateTime(ticket.checkOutAt) : '--'}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

