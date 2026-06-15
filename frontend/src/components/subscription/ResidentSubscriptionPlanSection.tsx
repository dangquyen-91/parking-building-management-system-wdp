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
    <section className="liquid-glass-card overflow-hidden rounded-2xl">
      <div className="flex items-center gap-3 border-b border-theme bg-gradient-to-r from-violet-500/15 via-transparent to-transparent p-5 md:p-6">
        <span className="flex size-11 items-center justify-center rounded-xl bg-violet-500 text-sm font-black text-white shadow-lg shadow-violet-500/20">
          2
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Gói cư dân</p>
          <h2 className="mt-1 text-xl font-bold text-fg">Chọn gói dành cho {VEHICLE_LABELS[vehicleType].toLowerCase()}</h2>
          <p className="mt-2 text-sm text-muted">Chỉ hiển thị các gói đang hoạt động và phù hợp với loại xe đã chọn.</p>
        </div>
      </div>

      {plans.length === 0 ? (
        <div className="m-5 rounded-xl border border-theme bg-badge p-5 text-sm text-muted">
          Hiện chưa có gói cư dân phù hợp với loại xe này.
        </div>
      ) : (
        <div className="grid gap-4 p-5 md:grid-cols-2 md:p-6">
          {plans.map((plan) => {
            const selected = selectedPlanId === plan._id

            return (
              <button
                key={plan._id}
                type="button"
                onClick={() => onPlanChange(plan._id)}
                className={[
                  'relative min-h-44 overflow-hidden rounded-xl border p-5 text-left transition-all',
                  selected
                    ? 'border-theme-strong bg-btn-primary text-btn-primary-fg shadow-xl'
                    : 'border-theme bg-badge text-muted hover:-translate-y-0.5 hover:bg-ghost hover:text-fg',
                ].join(' ')}
              >
                {selected && <span className="absolute right-4 top-4 rounded-full bg-emerald-500 px-2.5 py-1 text-[10px] font-bold text-white">ĐÃ CHỌN</span>}
                <span className="block pr-16 text-base font-bold">{plan.name}</span>
                <span className="mt-4 block text-3xl font-black">{formatSubscriptionCurrency(plan.price)}</span>
                <span className="mt-1 block text-xs font-semibold opacity-75">{plan.durationDays} ngày sử dụng</span>
                <span className="mt-4 block border-t border-current/15 pt-3 text-xs leading-relaxed opacity-75">{plan.description || 'Gói cư dân đang hoạt động.'}</span>
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}
