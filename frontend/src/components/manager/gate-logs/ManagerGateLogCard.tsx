import type { GateSession, GateUser } from '../../../services/staffGateApi'
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

function formatDuration(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000))
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return hours > 0 ? `${hours} giờ ${remainingMinutes} phút` : `${remainingMinutes} phút`
}

function getStaffName(staff?: GateUser | string | null) {
  if (!staff) return 'Không xác định'
  return typeof staff === 'string' ? staff : staff.fullName || staff.email || 'Không xác định'
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
    <div className="min-w-0 rounded-xl bg-page/55 p-3">
      <p className="text-xs text-subtle">{label}</p>
      <p
        className={[
          'mt-1 font-semibold text-fg',
          wrap ? 'line-clamp-2 break-words leading-snug' : 'truncate',
        ].join(' ')}
        title={title ?? value}
      >
        {value}
      </p>
      {subValue && <p className="mt-1 truncate text-xs text-muted">{subValue}</p>}
    </div>
  )
}

export function ManagerGateLogCard({ session }: ManagerGateLogCardProps) {
  const spotLabel = formatSessionSpot(session)

  return (
    <article className="rounded-2xl border border-theme bg-badge p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-ghost hover:shadow-lg">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[1.15fr_repeat(4,minmax(0,1fr))_minmax(9rem,auto)] xl:items-stretch">
        <div className="min-w-0 rounded-xl bg-page/55 p-3">
          <p className="truncate text-lg font-black tracking-[0.06em] text-fg">{session.licensePlate}</p>
          <p className="mt-1 truncate text-xs text-subtle">{session._id}</p>
        </div>

        <InfoCell
          label="Phân loại"
          value={formatVehicleType(session.vehicleType)}
          subValue={formatCustomerType(session.customerType)}
        />
        <InfoCell label="Vị trí" value={spotLabel} title={spotLabel} wrap />
        <InfoCell label="Nhân viên ghi nhận" value={getStaffName(session.staffId)} />
        <InfoCell label="Thời gian vào" value={formatDateTime(session.entryTime)} />

        <div className="flex min-w-0 flex-col justify-center gap-2 rounded-xl bg-page/55 p-3">
          <ManagerStatusBadge status="active" label="Đang trong bãi" />
          <p className="truncate text-xs text-muted">Đã gửi {formatDuration(session.entryTime)}</p>
        </div>
      </div>

      {session.note && <p className="mt-3 border-t border-theme pt-3 text-xs text-muted">{session.note}</p>}
    </article>
  )
}
