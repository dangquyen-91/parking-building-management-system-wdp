import type { Floor } from '../../services/managerBuildingsApi'
import type { GateSession } from '../../services/staffGateApi'
import { formatStaffVehicleDateTime, formatStaffVehicleDuration } from '../../utils/staffVehicleUi'
import { formatCustomerType, formatSessionSpot, formatVehicleType } from './staffGateUtils'

type StaffVehicleCardProps = {
  session: GateSession
  floorMap: Map<string, Floor>
  onCheckout: (session: GateSession) => void
}

export function StaffVehicleCard({ session, floorMap, onCheckout }: StaffVehicleCardProps) {
  return (
    <article className="grid gap-4 rounded-lg border border-theme bg-badge p-4 lg:grid-cols-[1.1fr_0.8fr_1.2fr_0.9fr_auto] lg:items-center">
      <div className="min-w-0">
        <p className="truncate text-lg font-semibold text-fg">{session.licensePlate}</p>
        <p className="mt-1 truncate text-xs text-subtle">{session._id}</p>
      </div>
      <div>
        <p className="text-xs text-subtle">Phân loại</p>
        <p className="mt-1 text-sm font-medium text-fg">{formatVehicleType(session.vehicleType)}</p>
        <p className="mt-1 text-xs text-muted">{formatCustomerType(session.customerType)}</p>
      </div>
      <div className="min-w-0">
        <p className="text-xs text-subtle">Vị trí</p>
        <p className="mt-1 truncate text-sm font-medium text-fg">{formatSessionSpot(session, floorMap)}</p>
      </div>
      <div>
        <p className="text-xs text-subtle">Thời gian gửi</p>
        <p className="mt-1 text-sm font-medium text-fg">{formatStaffVehicleDateTime(session.entryTime)}</p>
        <p className="mt-1 text-xs text-muted">Đã gửi {formatStaffVehicleDuration(session.entryTime)}</p>
      </div>
      <button
        type="button"
        onClick={() => onCheckout(session)}
        className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg"
      >
        Xử lý xe ra
      </button>
    </article>
  )
}
