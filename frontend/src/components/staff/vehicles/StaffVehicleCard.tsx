import type { ReactNode } from 'react'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { GateSession } from '../../../services/staffGateApi'
import { formatStaffVehicleDateTime, formatStaffVehicleDuration } from '../../../utils/staffVehicleUi'
import { formatCustomerType, formatSessionSpot, formatVehicleType } from '../data/staffGateUtils'

type StaffVehicleCardProps = {
  session: GateSession
  floorMap: Map<string, Floor>
  onCheckout: (session: GateSession) => void
}

function InfoBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-subtle">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  )
}

export function StaffVehicleCard({ session, floorMap, onCheckout }: StaffVehicleCardProps) {
  return (
    <article className="group overflow-hidden rounded-2xl border border-theme bg-page/70 shadow-sm transition-all hover:-translate-y-0.5 hover:border-theme-strong hover:bg-ghost hover:shadow-lg">
      <div className="grid gap-4 p-4 lg:grid-cols-[1.05fr_0.8fr_1.25fr_1fr_auto] lg:items-center">
        <div className="min-w-0">
          <p className="mb-2 pl-4 text-[10px] font-bold uppercase tracking-[0.12em] text-subtle">Biển số xe</p>
          <div className="flex items-center gap-2">
            <span className="size-2 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]" />
            <p className="truncate text-2xl font-black tracking-[0.06em] text-fg">{session.licensePlate}</p>
          </div>
        </div>

        <InfoBlock label="Phân loại">
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-full border border-theme bg-badge px-2.5 py-1 text-[11px] font-bold text-fg">
              {formatVehicleType(session.vehicleType)}
            </span>
            <span className="rounded-full border border-theme bg-badge px-2.5 py-1 text-[11px] text-muted">
              {formatCustomerType(session.customerType)}
            </span>
          </div>
        </InfoBlock>

        <InfoBlock label="Vị trí hiện tại">
          <p className="line-clamp-2 text-sm font-bold leading-5 text-fg">{formatSessionSpot(session, floorMap)}</p>
        </InfoBlock>

        <InfoBlock label="Thời gian gửi">
          <p className="text-sm font-bold text-fg">{formatStaffVehicleDateTime(session.entryTime)}</p>
          <p className="mt-1 text-xs font-semibold text-amber-600 dark:text-amber-300">
            Đã gửi {formatStaffVehicleDuration(session.entryTime)}
          </p>
        </InfoBlock>

        <button
          type="button"
          onClick={() => onCheckout(session)}
          className="h-12 rounded-2xl bg-btn-primary px-5 text-sm font-black text-btn-primary-fg shadow-lg transition-transform group-hover:-translate-y-0.5"
        >
          Xử lý xe ra →
        </button>
      </div>
    </article>
  )
}
