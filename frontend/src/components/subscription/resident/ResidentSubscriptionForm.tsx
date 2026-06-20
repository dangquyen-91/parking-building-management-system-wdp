import type { VehicleType } from '../../../services/userSubscriptionApi'
import { VEHICLE_LABELS } from '../../../utils/subscriptionUi'

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
    <section className="liquid-glass-card overflow-hidden rounded-2xl">
      <div className="border-b border-theme bg-gradient-to-r from-sky-500/15 via-transparent to-transparent p-5 md:p-6">
        <div className="flex items-center gap-3">
          <span className="flex size-11 items-center justify-center rounded-xl bg-sky-500 text-sm font-black text-white shadow-lg shadow-sky-500/20">
            1
          </span>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Thông tin xe</p>
            <h2 className="mt-1 text-xl font-bold text-fg">Chọn phương tiện đăng ký</h2>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">
          Chọn loại phương tiện và nhập biển số để xem các gói cư dân phù hợp.
        </p>

      </div>

      <div className="grid gap-6 p-5 md:p-6">
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

        <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
          Biển số xe
          <input
            className="auth-input h-14 rounded-xl border px-4 text-lg font-black uppercase tracking-[0.1em] text-fg"
            value={licensePlate}
            onChange={(event) => onLicensePlateChange(event.target.value)}
            placeholder="VD: 59X2-481.22"
          />
          <span className="text-[11px] font-normal normal-case tracking-normal text-muted">
            Biển số này sẽ được dùng để nhận diện xe tại cổng.
          </span>
        </label>
      </div>
    </section>
  )
}
