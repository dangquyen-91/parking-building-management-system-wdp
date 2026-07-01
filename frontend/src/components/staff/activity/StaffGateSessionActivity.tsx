import type { GateSession } from '../../../services/staffGateApi'
import { formatGateTime } from '../data/staffGateUi'
import { formatCustomerType, formatSessionSpot } from '../data/staffGateUtils'

type StaffGateSessionActivityProps = {
  sessions: GateSession[]
}

export function StaffGateSessionActivity({ sessions }: StaffGateSessionActivityProps) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-theme bg-badge shadow-sm">
      <div className="border-b border-theme bg-gradient-to-r from-sky-500/10 to-transparent p-4 md:p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-subtle">Log ca trực</p>
        <div className="mt-1 flex items-end justify-between gap-3">
          <h2 className="text-lg font-black text-fg">Hoạt động gần đây</h2>
          <span className="rounded-full border border-theme bg-page px-3 py-1 text-[10px] font-bold text-subtle">
            {sessions.length} lượt
          </span>
        </div>
      </div>

      <div className="max-h-[38rem] divide-y divide-[color:var(--border)] overflow-auto">
        {sessions.length > 0 ? (
          sessions.slice(0, 8).map((session) => {
            const isActive = session.status === 'active'

            return (
              <div key={session._id} className="p-4 transition-colors hover:bg-ghost">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-lg font-black tracking-[0.04em] text-fg">{session.licensePlate}</p>
                    <p className="mt-1 text-xs text-muted">{formatCustomerType(session.customerType)}</p>
                  </div>
                  <span
                    className={[
                      'shrink-0 rounded-full px-2.5 py-1 text-[10px] font-black',
                      isActive
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
                        : 'bg-violet-500/10 text-violet-700 dark:text-violet-200',
                    ].join(' ')}
                  >
                    {isActive ? 'XE VÀO' : 'XE RA'}
                  </span>
                </div>
                <div className="mt-3 grid gap-2 text-xs">
                  <p className="line-clamp-2 text-muted">{formatSessionSpot(session)}</p>
                  <p className="font-semibold text-subtle">
                    {isActive
                      ? `Vào ${formatGateTime(session.entryTime)}`
                      : `Ra ${session.exitTime ? formatGateTime(session.exitTime) : '--'}`}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <p className="p-8 text-center text-sm text-muted">Chưa có hoạt động trong ca trực.</p>
        )}
      </div>
    </section>
  )
}
