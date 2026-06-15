import type { GateSession, GateUser } from '../../services/staffGateApi'
import { formatCustomerType, formatSessionSpot, formatVehicleType } from '../staff/staffGateUtils'
import { ManagerStatusBadge } from './ManagerStatusBadge'

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

export function ManagerGateLogCard({ session }: ManagerGateLogCardProps) {
  return (
    <article className="rounded-lg border border-theme bg-badge p-4">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:items-center">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-fg">{session.licensePlate}</p>
          <p className="mt-1 truncate text-xs text-subtle">{session._id}</p>
        </div>

        <div className="min-w-0">
          <p className="text-xs text-subtle">Phân loại</p>
          <p className="mt-1 truncate font-medium text-fg">{formatVehicleType(session.vehicleType)}</p>
          <p className="mt-1 truncate text-xs text-muted">{formatCustomerType(session.customerType)}</p>
        </div>

        <div className="min-w-0">
          <p className="text-xs text-subtle">Vị trí</p>
          <p className="mt-1 truncate font-medium text-fg">{formatSessionSpot(session)}</p>
        </div>

        <div className="min-w-0">
          <p className="text-xs text-subtle">Nhân viên ghi nhận</p>
          <p className="mt-1 truncate font-medium text-fg">{getStaffName(session.staffId)}</p>
        </div>

        <div className="min-w-0">
          <p className="text-xs text-subtle">Thời gian vào</p>
          <p className="mt-1 font-medium text-fg">{formatDateTime(session.entryTime)}</p>
        </div>

        <div className="flex min-w-0 flex-col gap-2">
          <ManagerStatusBadge status="active" label="Đang trong bãi" />
          <p className="text-xs text-muted">Đã gửi {formatDuration(session.entryTime)}</p>
        </div>
      </div>

      {session.note && <p className="mt-3 border-t border-theme pt-3 text-xs text-muted">{session.note}</p>}
    </article>
  )
}
