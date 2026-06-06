import { useMemo, useState } from 'react'
import {
  INITIAL_TICKETS,
  StaffPageHeader,
  calculateMotorbikeFee,
  formatGateTime,
  formatStaffCurrency,
  visitorTypeLabel,
} from '../components/staff'

export function StaffLostTicketPage() {
  const [plate, setPlate] = useState('')
  const activeTickets = INITIAL_TICKETS.filter((ticket) => ticket.status === 'active')
  const matchedTicket = useMemo(() => {
    const normalizedPlate = plate.trim().toLowerCase()

    if (!normalizedPlate) return undefined

    return activeTickets.find((ticket) => ticket.plate.toLowerCase().includes(normalizedPlate))
  }, [activeTickets, plate])
  const estimate = matchedTicket ? calculateMotorbikeFee(matchedTicket.checkInAt) : undefined

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <StaffPageHeader
        eyebrow="Staff // Lost Ticket"
        title="Lost Ticket Lookup"
        description="Ho tro khach mat ve bang cach tra cuu bien so, doi chieu gio vao va ghi nhan xu ly thu cong."
      />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">Bien so xe</span>
            <input
              value={plate}
              onChange={(event) => setPlate(event.target.value)}
              placeholder="VD: 59X2"
              className="auth-input h-11 rounded-lg border px-3 text-sm font-semibold uppercase text-fg"
            />
          </label>

          <div className="mt-5 rounded-lg border border-theme bg-badge p-4">
            {matchedTicket ? (
              <dl className="grid gap-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-subtle">Bien so</dt>
                  <dd className="mt-1 font-semibold text-fg">{matchedTicket.plate}</dd>
                </div>
                <div>
                  <dt className="text-subtle">Loai khach</dt>
                  <dd className="mt-1 font-semibold text-fg">{visitorTypeLabel[matchedTicket.visitorType]}</dd>
                </div>
                <div>
                  <dt className="text-subtle">Vi tri</dt>
                  <dd className="mt-1 font-semibold text-fg">{matchedTicket.slot}</dd>
                </div>
                <div>
                  <dt className="text-subtle">Gio vao</dt>
                  <dd className="mt-1 font-semibold text-fg">{formatGateTime(matchedTicket.checkInAt)}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="text-subtle">Phi tam tinh</dt>
                  <dd className="mt-1 text-lg font-semibold text-fg">
                    {estimate?.hours}h / {estimate ? formatStaffCurrency(estimate.fee) : '--'}
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-sm text-muted">Nhap bien so de tim xe dang gui. Neu khong thay, staff can bao manager kiem tra camera/log cong.</p>
            )}
          </div>
        </section>

        <aside className="liquid-glass-card rounded-lg p-4 md:p-5">
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Manual checklist</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Xu ly mat ve</h2>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <p className="rounded-lg border border-theme bg-badge p-3">1. Doi chieu bien so va mo ta xe.</p>
            <p className="rounded-lg border border-theme bg-badge p-3">2. Kiem tra gio vao, vi tri, loai khach.</p>
            <p className="rounded-lg border border-theme bg-badge p-3">3. Ghi incident neu can manager duyet.</p>
            <p className="rounded-lg border border-theme bg-badge p-3">4. Thu phi va checkout thu cong sau khi xac minh.</p>
          </div>
        </aside>
      </div>
    </div>
  )
}

