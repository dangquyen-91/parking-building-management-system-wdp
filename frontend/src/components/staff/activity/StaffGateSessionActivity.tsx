import type { GateSession } from '../../../services/staffGateApi'
import { Activity, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { Badge } from '../../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Separator } from '../../ui/separator'
import { formatGateTime } from '../data/staffGateUi'
import { formatSessionCustomer, formatSessionSpot, isSessionBookingOvertime } from '../data/staffGateUtils'

type StaffGateSessionActivityProps = {
  sessions: GateSession[]
}

export function StaffGateSessionActivity({ sessions }: StaffGateSessionActivityProps) {
  return (
    <Card className="overflow-hidden rounded-2xl border-indigo-500/15 bg-gradient-to-br from-background to-indigo-500/5 shadow-lg shadow-slate-950/5">
      <CardHeader className="border-b bg-indigo-500/5 pb-4">
        <CardDescription className="flex items-center gap-2 font-semibold uppercase tracking-[0.14em]"><Activity className="size-4" /> Hoạt động gần đây</CardDescription>
        <div className="flex items-end justify-between gap-3">
          <CardTitle>Tổng</CardTitle>
          <Badge variant="secondary">{sessions.length} lượt</Badge>
        </div>
      </CardHeader>
      <CardContent className="max-h-[38rem] overflow-auto p-0">
        {sessions.length > 0 ? (
          sessions.slice(0, 8).map((session, index) => {
            const isActive = session.status === 'active'

            return (
              <div key={session._id}>
                {index > 0 && <Separator />}
                <div className="relative p-4 pl-5 transition-colors hover:bg-sky-500/5">
                  <span className={`absolute bottom-4 left-0 top-4 w-1 rounded-r-full ${isActive ? 'bg-sky-500' : 'bg-emerald-500'}`} />
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-lg font-bold tracking-[0.04em]">{session.licensePlate}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatSessionCustomer(session)}
                        {isSessionBookingOvertime(session) && ' · quá giờ (vãng lai)'}
                      </p>
                    </div>
                    <Badge className={isActive ? 'border-0 bg-sky-600 text-white' : 'border-0 bg-emerald-600 text-white'}>
                      {isActive ? <ArrowDownLeft className="size-3" /> : <ArrowUpRight className="size-3" />}
                      {isActive ? 'Xe vào' : 'Xe ra'}
                    </Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                    <p className="line-clamp-2">{formatSessionSpot(session)}</p>
                    <p className="font-medium">
                      {isActive
                        ? `Vào ${formatGateTime(session.entryTime)}`
                        : `Ra ${session.exitTime ? formatGateTime(session.exitTime) : '--'}`}
                    </p>
                  </div>
                </div>
              </div>
            )
          })
        ) : (
          <p className="p-8 text-center text-sm text-muted-foreground">Chưa có hoạt động trong ca trực.</p>
        )}
      </CardContent>
    </Card>
  )
}
