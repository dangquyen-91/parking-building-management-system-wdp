import type { GateSession, GateSessionStatus, GateUser } from '../../../services/staffGateApi'
import { formatCustomerType, formatSessionSpot, formatVehicleType } from '../../staff/data/staffGateUtils'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function formatDuration(entryTime: string, exitTime?: string) {
  const end = exitTime ? new Date(exitTime).getTime() : Date.now()
  const minutes = Math.max(0, Math.floor((end - new Date(entryTime).getTime()) / 60_000))
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return hours > 0 ? `${hours} giờ ${remainingMinutes} phút` : `${remainingMinutes} phút`
}

function getStaffName(staff?: GateUser | string | null) {
  if (!staff) return 'Không xác định'
  return typeof staff === 'string' ? staff : staff.fullName || staff.email || 'Không xác định'
}

const statusBadge: Record<GateSessionStatus, { status: 'active' | 'checkout' | 'cancelled'; label: string }> = {
  active: { status: 'active', label: 'Đang trong bãi' },
  completed: { status: 'checkout', label: 'Đã ra' },
  cancelled: { status: 'cancelled', label: 'Đã hủy' },
}

type ManagerGateLogCardProps = {
  session: GateSession
}

function InfoCell({
  label,
  value,
  subValue,
  title,
  wrap = false,
}: {
  label: string
  value: string
  subValue?: string
  title?: string
  wrap?: boolean
}) {
  return (
    <div className="flex min-h-20 min-w-0 flex-col justify-start rounded-xl bg-background/55 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={[
          'mt-1 font-semibold text-foreground',
          wrap ? 'line-clamp-2 break-words leading-snug' : 'truncate',
        ].join(' ')}
        title={title ?? value}
      >
        {value}
      </p>
      {subValue && <p className="mt-1 truncate text-xs text-muted-foreground">{subValue}</p>}
    </div>
  )
}

export function ManagerGateLogCard({ session }: ManagerGateLogCardProps) {
  const spotLabel = formatSessionSpot(session)
  const badge = statusBadge[session.status]
  const durationLabel = session.status === 'active' ? 'Đã gửi' : 'Thời lượng'
  const exitTimeLabel =
    session.status === 'completed' && session.exitTime ? `Ra ${formatDateTime(session.exitTime)}` : undefined

  return (
    <article className="rounded-2xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted hover:shadow-lg">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6 xl:items-stretch">
        <div className="flex min-h-20 min-w-0 flex-col justify-start rounded-xl bg-background/55 p-3">
          <p className="text-xs text-muted-foreground">Biển số xe</p>
          <p className="truncate text-lg font-black tracking-[0.06em] text-foreground">{session.licensePlate}</p>
        </div>

        <InfoCell
          label="Phân loại"
          value={formatVehicleType(session.vehicleType)}
          subValue={formatCustomerType(session.customerType)}
        />
        <InfoCell label="Vị trí" value={spotLabel} title={spotLabel} wrap />
        <InfoCell label="Nhân viên ghi nhận" value={getStaffName(session.staffId)} />
        <InfoCell label="Thời gian vào" value={formatDateTime(session.entryTime)} subValue={exitTimeLabel} />

        <div className="flex min-h-20 min-w-0 flex-col items-start justify-start rounded-xl bg-background/55 p-3 text-left">
          <p className="text-xs text-muted-foreground">Trạng thái</p>
          <div className="mt-1">
            <ManagerStatusBadge status={badge.status} label={badge.label} />
          </div>
          <p className="mt-1 w-full truncate text-xs leading-5 text-muted-foreground">
            {durationLabel} {formatDuration(session.entryTime, session.exitTime)}
          </p>
        </div>
      </div>

      {session.note && <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">{session.note}</p>}
    </article>
  )
}


