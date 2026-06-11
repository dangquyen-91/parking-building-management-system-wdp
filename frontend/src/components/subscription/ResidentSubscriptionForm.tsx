import type { Plan, VehicleType } from '../../services/userSubscriptionApi'
import { formatSubscriptionCurrency, VEHICLE_LABELS } from '../../utils/subscriptionUi'

type ResidentSubscriptionFormProps = {
  vehicleType: VehicleType
  plans: Plan[]
  selectedPlanId: string
  selectedPlan?: Plan
  licensePlate: string
  onVehicleTypeChange: (value: VehicleType) => void
  onPlanChange: (value: string) => void
  onLicensePlateChange: (value: string) => void
}

export function ResidentSubscriptionForm({
  vehicleType,
  plans,
  selectedPlanId,
  selectedPlan,
  licensePlate,
  onVehicleTypeChange,
  onPlanChange,
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
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Thông tin gói</p>
            <h2 className="mt-1 text-xl font-semibold text-fg">Chọn gói cho biển số xe</h2>
          </div>
        </div>
        <p className="mt-2 text-sm text-muted">
          {vehicleType === 'car'
            ? 'Ô tô cư dân sẽ chọn ô đỗ cố định ở bước tiếp theo.'
            : 'Xe máy cư dân dùng sức chứa chung của tầng xe máy cư dân, không cần chọn ô riêng.'}
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
          Gói cư dân
          <div className="grid gap-3 md:grid-cols-2">
            {plans.map((plan) => {
              const selected = selectedPlanId === plan._id

              return (
                <button
                  key={plan._id}
                  type="button"
                  onClick={() => onPlanChange(plan._id)}
                  className={[
                    'min-h-28 rounded-lg border p-4 text-left transition',
                    selected
                      ? 'border-transparent bg-btn-primary text-btn-primary-fg'
                      : 'border-theme bg-badge text-muted hover:bg-ghost hover:text-fg',
                  ].join(' ')}
                >
                  <span className="block text-sm font-semibold">{plan.name}</span>
                  <span className="mt-2 block text-lg font-bold">{formatSubscriptionCurrency(plan.price)}</span>
                  <span className="mt-1 block text-xs opacity-75">{plan.durationDays} ngày sử dụng</span>
                </button>
              )
            })}
          </div>
        </label>

        {selectedPlan && (
          <div className="rounded-lg border border-theme bg-badge p-4 text-sm">
            <p className="font-semibold text-fg">{selectedPlan.name}</p>
            <p className="mt-1 text-muted">{selectedPlan.description || 'Gói cư dân đang hoạt động.'}</p>
            <p className="mt-2 text-sm font-semibold text-fg">{formatSubscriptionCurrency(selectedPlan.price)}</p>
          </div>
        )}

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
