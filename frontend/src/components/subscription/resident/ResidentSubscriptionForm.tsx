import { Link } from 'react-router-dom'
import type { UserVehicle } from '../../../services/authApi'
import type { VehicleType } from '../../../services/userSubscriptionApi'
import { VEHICLE_LABELS } from '../../../utils/subscriptionUi'

type ResidentSubscriptionFormProps = {
  vehicleType: VehicleType
  licensePlate: string
  onVehicleTypeChange: (value: VehicleType) => void
  onLicensePlateChange: (value: string) => void
  registeredVehicles: UserVehicle[]
  lockedVehicleType?: boolean
  selectedPlanName?: string
}

export function ResidentSubscriptionForm({
  vehicleType,
  licensePlate,
  onVehicleTypeChange,
  onLicensePlateChange,
  registeredVehicles,
  lockedVehicleType = false,
  selectedPlanName,
}: ResidentSubscriptionFormProps) {
  return (
    <section className="liquid-glass-card overflow-hidden rounded-2xl">
      <div className="border-b border-theme bg-gradient-to-r from-sky-500/15 via-transparent to-transparent p-5 md:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-sky-500 text-sm font-black text-white shadow-lg shadow-sky-500/20">
            1
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Thông tin xe</p>
            <h2 className="mt-1 text-xl font-bold text-fg">
              {lockedVehicleType ? 'Chọn biển số xe' : 'Chọn phương tiện đăng ký'}
            </h2>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">
          {lockedVehicleType
            ? 'Gói và loại xe đã được chọn sẵn. Chọn một biển số đã lưu trong hồ sơ để tiếp tục.'
            : 'Chọn loại phương tiện và biển số đã lưu để xem các gói cư dân phù hợp.'}
        </p>
      </div>

      <div className="grid gap-6 p-5 md:p-6">
        {lockedVehicleType ? (
          <div className="rounded-xl border border-theme bg-badge p-4 text-sm text-muted">
            <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Gói đã chọn</span>
            <span className="mt-2 block text-base font-bold text-fg">{selectedPlanName || 'Gói cư dân'}</span>
            <span className="mt-1 block text-xs">Loại xe: {VEHICLE_LABELS[vehicleType]}</span>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {(['motorcycle', 'car'] as const).map((type) => (
              <button
                key={type}
                type="button"
                className={[
                  'min-h-24 rounded-xl border p-4 text-left text-sm transition-all',
                  vehicleType === type
                    ? 'border-theme-strong bg-btn-primary text-btn-primary-fg shadow-lg'
                    : 'border-theme bg-badge text-muted hover:-translate-y-0.5 hover:bg-ghost hover:text-fg',
                ].join(' ')}
                onClick={() => onVehicleTypeChange(type)}
              >
                <span className="block text-base font-bold">{VEHICLE_LABELS[type]}</span>
                <span className="mt-1 block text-xs opacity-75">
                  {type === 'car' ? 'Giữ ô đỗ cố định' : 'Dùng sức chứa chung'}
                </span>
              </button>
            ))}
          </div>
        )}

        {registeredVehicles.length > 0 ? (
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
            Biển số xe đã đăng ký
            <select
              className="auth-input h-14 rounded-xl border px-4 text-base font-black uppercase tracking-[0.08em] text-fg"
              value={licensePlate}
              onChange={(event) => onLicensePlateChange(event.target.value)}
              required
            >
              <option value="">Chọn biển số xe</option>
              {registeredVehicles.map((vehicle) => (
                <option key={vehicle._id} value={vehicle.licensePlate}>
                  {vehicle.licensePlate} — {VEHICLE_LABELS[vehicle.vehicleType]}
                </option>
              ))}
            </select>
            <span className="text-[11px] font-normal normal-case tracking-normal text-muted">
              Chỉ hiển thị phương tiện phù hợp với loại gói đang chọn.
            </span>
          </label>
        ) : (
          <div className="rounded-xl border border-dashed border-amber-500/40 bg-amber-500/10 p-5">
            <p className="text-sm font-bold text-fg">Chưa có biển số {VEHICLE_LABELS[vehicleType].toLowerCase()}</p>
            <p className="mt-1 text-xs leading-5 text-muted">
              Bạn cần thêm biển số phù hợp vào hồ sơ trước khi đăng ký gói này.
            </p>
            <Link
              to="/profile"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-amber-600 px-4 text-sm font-bold text-white transition hover:bg-amber-700"
            >
              Thêm biển số tại hồ sơ
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
