import type { VehicleType } from '../../services/userSubscriptionApi'
import { VEHICLE_LABELS } from '../../utils/subscriptionUi'

type ResidentSubscriptionFormProps = {
  vehicleType: VehicleType
  licensePlate: string
  onVehicleTypeChange: (value: VehicleType) => void
  onLicensePlateChange: (value: string) => void
}

export function ResidentSubscriptionForm({
  vehicleType,
  licensePlate,
  onVehicleTypeChange,
  onLicensePlateChange,
}: ResidentSubscriptionFormProps) {
  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-6">
      <div className="border-b border-theme pb-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-btn-primary text-sm font-bold text-btn-primary-fg">
            1
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Thông tin xe</p>
            <h2 className="mt-1 text-xl font-semibold text-fg">Chọn loại xe và nhập biển số</h2>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">
          Các gói cư dân phù hợp với loại xe sẽ được hiển thị ở bước tiếp theo.
        </p>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {(['motorcycle', 'car'] as const).map((type) => (
            <button
              key={type}
              type="button"
              className={[
                'min-h-16 rounded-lg border px-4 text-left text-sm transition',
                vehicleType === type
                  ? 'border-transparent bg-btn-primary text-btn-primary-fg'
                  : 'border-theme text-muted hover:bg-ghost hover:text-fg',
              ].join(' ')}
              onClick={() => onVehicleTypeChange(type)}
            >
              <span className="block font-semibold">{VEHICLE_LABELS[type]}</span>
              <span className="mt-1 block text-xs opacity-75">
                {type === 'car' ? 'Giữ ô đỗ cố định' : 'Dùng sức chứa chung'}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4">
        <label className="grid gap-2 text-xs font-medium text-subtle">
          Biển số xe
          <input
            className="auth-input h-11 rounded-lg border px-3 text-sm font-semibold uppercase text-fg"
            value={licensePlate}
            onChange={(event) => onLicensePlateChange(event.target.value)}
            placeholder="VD: 59X2-481.22"
          />
        </label>
      </div>
    </section>
  )
}
