import type { Floor } from '../../../services/managerBuildingsApi'
import type { GateSession } from '../../../services/staffGateApi'
import { formatStaffVehicleDateTime, formatStaffVehicleDuration } from '../../../utils/staffVehicleUi'
import { formatCustomerType, formatSessionSpot, formatVehicleType } from '../data/staffGateUtils'

type StaffVehicleCardProps = {
  session: GateSession
  floorMap: Map<string, Floor>
  onCheckout: (session: GateSession) => void
}

export function StaffVehicleCard({ session, floorMap, onCheckout }: StaffVehicleCardProps) {
  return (
    <article className="group overflow-hidden rounded-xl border border-theme bg-badge transition-all hover:-translate-y-0.5 hover:border-theme-strong hover:shadow-lg">
      <div className="grid gap-4 p-4 lg:grid-cols-[1.1fr_0.8fr_1.3fr_1fr_auto] lg:items-center">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            <p className="truncate text-xl font-black tracking-[0.06em] text-fg">{session.licensePlate}</p>
          </div>
          <p className="mt-1 truncate pl-4 text-[10px] text-subtle">Mã phiên: {session._id}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">Phân loại</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="rounded-full border border-theme bg-page px-2.5 py-1 text-[11px] font-semibold text-fg">
              {formatVehicleType(session.vehicleType)}
            </span>
            <span className="rounded-full border border-theme bg-page px-2.5 py-1 text-[11px] text-muted">
              {formatCustomerType(session.customerType)}
            </span>
          </div>
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">Vị trí hiện tại</p>
          <p className="mt-2 line-clamp-2 text-sm font-semibold text-fg">{formatSessionSpot(session, floorMap)}</p>
        </div>
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">Thời gian gửi</p>
          <p className="mt-2 text-sm font-semibold text-fg">{formatStaffVehicleDateTime(session.entryTime)}</p>
          <p className="mt-1 text-xs font-medium text-amber-600 dark:text-amber-300">
            Đã gửi {formatStaffVehicleDuration(session.entryTime)}
          </p>
        </div>
        <button
          type="button"
          onClick={() => onCheckout(session)}
          className="h-11 rounded-xl bg-btn-primary px-5 text-sm font-bold text-btn-primary-fg shadow-lg transition-transform group-hover:-translate-y-0.5"
        >
          Xử lý xe ra →
        </button>
      </div>
    </article>
  )
}
