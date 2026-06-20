import type { GateSession } from '../../services/staffGateApi'
import { formatGateTime } from './staffGateData'
import { formatCustomerType, formatSessionSpot } from './staffGateUtils'

type StaffGateSessionActivityProps = {
  sessions: GateSession[]
}

export function StaffGateSessionActivity({ sessions }: StaffGateSessionActivityProps) {
  return (
    <section className="liquid-glass-card overflow-hidden rounded-2xl">
      <div className="border-b border-theme p-4 md:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-subtle">Log ca trực</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h2 className="text-base font-bold text-fg">Hoạt động gần đây</h2>
          <span className="rounded-full border border-theme bg-badge px-2.5 py-1 text-[10px] font-semibold text-subtle">
            {sessions.length} lượt
          </span>
        </div>
      </div>

      <div className="divide-y divide-[color:var(--border)]">
        {sessions.length > 0 ? (
          sessions.slice(0, 6).map((session) => (
            <div key={session._id} className="p-4 transition-colors hover:bg-ghost">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-bold tracking-wide text-fg">{session.licensePlate}</p>
                  <p className="mt-1 text-xs text-muted">{formatCustomerType(session.customerType)}</p>
                </div>
                <span className={[
                  'rounded-full px-2.5 py-1 text-[10px] font-bold',
                  session.status === 'active'
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
                    : 'bg-badge text-subtle',
                ].join(' ')}>
                  {session.status === 'active' ? 'XE VÀO' : 'XE RA'}
                </span>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3 text-xs">
                <p className="line-clamp-2 text-muted">{formatSessionSpot(session)}</p>
                <p className="shrink-0 font-medium text-subtle">
                  {session.status === 'active'
                    ? `Vào ${formatGateTime(session.entryTime)}`
                    : `Ra ${session.exitTime ? formatGateTime(session.exitTime) : '--'}`}
                </p>
              </div>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-sm text-muted">Chưa có hoạt động trong ca trực.</p>
        )}
      </div>
    </section>
  )
}
