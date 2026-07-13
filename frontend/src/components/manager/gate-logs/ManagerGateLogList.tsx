import type { GateSession } from '../../../services/staffGateApi'
import { ManagerGateLogCard } from './ManagerGateLogCard'

type ManagerGateLogListProps = {
  sessions: GateSession[]
  isLoading: boolean
}

export function ManagerGateLogList({ sessions, isLoading }: ManagerGateLogListProps) {
  if (isLoading) {
    return <div className="bg-card text-card-foreground ring-1 ring-border rounded-lg p-4 text-sm text-muted-foreground">Đang tải hoạt động cổng...</div>
  }

  if (sessions.length === 0) {
    return <div className="bg-card text-card-foreground ring-1 ring-border rounded-lg p-4 text-sm text-muted-foreground">Không có phiên gửi xe phù hợp.</div>
  }

  return (
    <section className="bg-card text-card-foreground ring-1 ring-border rounded-2xl border border-border p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Giám sát trực tiếp</p>
          <h2 className="mt-1 text-base font-semibold text-foreground">Xe đang trong bãi</h2>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-semibold text-muted-foreground">
          {sessions.length} xe
        </span>
      </div>

      <div className="grid gap-3">
        {sessions.map((session) => <ManagerGateLogCard key={session._id} session={session} />)}
      </div>
    </section>
  )
}


