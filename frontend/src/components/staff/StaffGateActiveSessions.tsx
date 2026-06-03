import type { GateSession } from '../../services/staffGateApi'
import { formatGateTime } from './staffGateData'
import { formatCustomerType, formatSessionSpot } from './staffGateUtils'

type StaffGateActiveSessionsProps = {
  sessions: GateSession[]
  selectedSessionId?: string
  onSelectSession: (session: GateSession) => void
}

export function StaffGateActiveSessions({
  sessions,
  selectedSessionId,
  onSelectSession,
}: StaffGateActiveSessionsProps) {
  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Trong bãi</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Xe đang gửi</h2>
        </div>
        <span className="rounded-full border border-theme px-3 py-1 text-xs text-subtle">
          {sessions.length} xe
        </span>
      </div>

      <div className="grid gap-2">
        {sessions.map((session) => {
          const selected = selectedSessionId === session._id

          return (
            <button
              key={session._id}
              type="button"
              onClick={() => onSelectSession(session)}
              className={[
                'rounded-lg border p-3 text-left transition-colors',
                selected
                  ? 'border-theme-strong bg-btn-primary text-btn-primary-fg'
                  : 'border-theme bg-badge text-muted hover:bg-ghost hover:text-fg',
              ].join(' ')}
            >
              <span className="flex items-start justify-between gap-3">
                <span>
                  <span className="block text-sm font-semibold">{session.licensePlate}</span>
                  <span className="mt-1 block text-xs opacity-75">
                    {formatSessionSpot(session)} / {formatCustomerType(session.customerType)}
                  </span>
                </span>
                <span className="text-xs opacity-75">{formatGateTime(session.entryTime)}</span>
              </span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
