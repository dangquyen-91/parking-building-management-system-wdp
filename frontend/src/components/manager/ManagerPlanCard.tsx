import type { ManagerPlan } from '../../services/managerPlansApi'
import { formatSubscriptionCurrency, VEHICLE_LABELS } from '../../utils/subscriptionUi'
import { ManagerStatusBadge } from './ManagerStatusBadge'

type ManagerPlanCardProps = {
  plan: ManagerPlan
  isUpdating: boolean
  onEdit: (plan: ManagerPlan) => void
  onToggle: (plan: ManagerPlan) => void
}

export function ManagerPlanCard({
  plan,
  isUpdating,
  onEdit,
  onToggle,
}: ManagerPlanCardProps) {
  return (
    <article className="liquid-glass-card rounded-xl border border-theme p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">{plan.code}</p>
          <h2 className="mt-2 text-xl font-semibold text-fg">{plan.name}</h2>
          <p className="mt-1 text-xs text-muted">
            {VEHICLE_LABELS[plan.vehicleType]} / {plan.durationDays} ngày
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 text-right">
          <ManagerStatusBadge
            status={plan.isActive ? 'active' : 'inactive'}
            label={plan.isActive ? 'Đang mở bán' : 'Tạm dừng'}
          />
          <p className="max-w-40 text-[11px] font-medium text-subtle">
            {plan.isActive ? 'Người dùng có thể đăng ký' : 'Không hiển thị để đăng ký'}
          </p>
        </div>
      </div>

      <p className="mt-5 text-2xl font-bold text-fg">{formatSubscriptionCurrency(plan.price)}</p>
      <p className="mt-3 min-h-10 text-sm text-muted">{plan.description || 'Chưa có mô tả.'}</p>

      <div className="mt-5 flex flex-col gap-2 border-t border-theme pt-4 sm:flex-row">
        <button
          type="button"
          className="h-10 flex-1 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg"
          onClick={() => onEdit(plan)}
        >
          Chỉnh sửa
        </button>
        <button
          type="button"
          disabled={isUpdating}
          className="h-10 flex-1 rounded-lg border border-theme px-4 text-sm font-semibold text-fg hover:bg-badge disabled:opacity-60"
          onClick={() => onToggle(plan)}
        >
          {isUpdating ? 'Đang cập nhật...' : plan.isActive ? 'Tạm dừng gói' : 'Mở lại gói'}
        </button>
      </div>
    </article>
  )
}
