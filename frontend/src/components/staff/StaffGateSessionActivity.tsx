import type { GateSession } from '../../services/staffGateApi'
import { formatGateTime } from './staffGateData'
import { formatCustomerType, formatSessionSpot } from './staffGateUtils'

type StaffGateSessionActivityProps = {
  sessions: GateSession[]
}

export function StaffGateSessionActivity({ sessions }: StaffGateSessionActivityProps) {
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
          {sessions.slice(0, 6).map((session) => (
            <div key={session._id} className="grid gap-3 px-4 py-3 text-sm md:grid-cols-[1fr_0.8fr_0.8fr_0.8fr]">
              <div>
                <p className="font-semibold text-fg">{session.licensePlate}</p>
                <p className="mt-1 text-xs text-subtle">{session._id}</p>
              </div>
              <p className="text-muted">{formatCustomerType(session.customerType)}</p>
              <p className="text-muted">{formatSessionSpot(session)}</p>
              <p className={session.status === 'active' ? 'text-emerald-300' : 'text-subtle'}>
                {session.status === 'active'
                  ? `Vào ${formatGateTime(session.entryTime)}`
                  : `Ra ${session.exitTime ? formatGateTime(session.exitTime) : '--'}`}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
