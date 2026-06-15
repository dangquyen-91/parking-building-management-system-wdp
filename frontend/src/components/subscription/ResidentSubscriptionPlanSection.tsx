import type { Plan, VehicleType } from '../../services/userSubscriptionApi'
import { formatSubscriptionCurrency, VEHICLE_LABELS } from '../../utils/subscriptionUi'

type ResidentSubscriptionPlanSectionProps = {
  vehicleType: VehicleType
  plans: Plan[]
  selectedPlanId: string
  onPlanChange: (value: string) => void
}

export function ResidentSubscriptionPlanSection({
  vehicleType,
  plans,
  selectedPlanId,
  onPlanChange,
}: ResidentSubscriptionPlanSectionProps) {
  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-3 border-b border-theme pb-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-btn-primary text-sm font-bold text-btn-primary-fg">
          2
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Gói cư dân</p>
          <h2 className="mt-1 text-xl font-semibold text-fg">Chọn gói dành cho {VEHICLE_LABELS[vehicleType].toLowerCase()}</h2>
          <p className="mt-2 text-sm text-muted">Chỉ hiển thị các gói đang hoạt động và phù hợp với loại xe đã chọn.</p>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="mt-5 rounded-lg border border-theme bg-badge p-5 text-sm text-muted">
          Hiện chưa có gói cư dân phù hợp với loại xe này.
        </div>
      ) : (
        <div className="mt-5 grid gap-3 md:grid-cols-2">
          {plans.map((plan) => {
            const selected = selectedPlanId === plan._id

            return (
              <button
                key={plan._id}
                type="button"
                onClick={() => onPlanChange(plan._id)}
                className={[
                  'min-h-36 rounded-lg border p-4 text-left transition',
                  selected
                    ? 'border-transparent bg-btn-primary text-btn-primary-fg'
                    : 'border-theme bg-badge text-muted hover:bg-ghost hover:text-fg',
                ].join(' ')}
              >
                <span className="block text-base font-semibold">{plan.name}</span>
                <span className="mt-2 block text-2xl font-bold">{formatSubscriptionCurrency(plan.price)}</span>
                <span className="mt-1 block text-xs opacity-75">{plan.durationDays} ngày sử dụng</span>
                <span className="mt-3 block text-xs opacity-75">{plan.description || 'Gói cư dân đang hoạt động.'}</span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
