import { Button } from '@/components/ui/button'
import type { ManagerPlan } from '../../../services/managerPlansApi'
import { formatSubscriptionCurrency, VEHICLE_LABELS } from '../../../utils/subscriptionUi'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'

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
    <article className="bg-card text-card-foreground ring-1 ring-border group relative flex h-full min-h-72 flex-col overflow-hidden rounded-xl border border-border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-emerald-500 to-violet-500 opacity-70" />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{plan.code}</p>
          <h2 className="mt-2 text-xl font-black text-foreground">{plan.name}</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            {VEHICLE_LABELS[plan.vehicleType]} / {plan.durationDays} ngày
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5 text-right">
          <ManagerStatusBadge
            status={plan.isActive ? 'active' : 'inactive'}
            label={plan.isActive ? 'Đang mở bán' : 'Tạm dừng'}
          />
          <p className="max-w-40 text-[11px] font-medium text-muted-foreground">
            {plan.isActive ? 'Người dùng có thể đăng ký' : 'Không hiển thị để đăng ký'}
          </p>
        </div>
      </div>

      <p className="mt-5 text-3xl font-black tracking-tight text-foreground">{formatSubscriptionCurrency(plan.price)}</p>
      <p className="mt-3 min-h-10 flex-1 text-sm text-muted-foreground">{plan.description || 'Chưa có mô tả.'}</p>

      <div className="mt-5 grid gap-2 border-t border-border pt-4 sm:grid-cols-2">
        <Button
          type="button"
          size="lg"
          onClick={() => onEdit(plan)}
        >
          Chỉnh sửa
        </Button>
        <Button
          type="button"
          variant={plan.isActive ? 'destructive' : 'outline'}
          disabled={isUpdating}
          size="lg"
          className="disabled:opacity-60"
          onClick={() => onToggle(plan)}
        >
          {isUpdating ? 'Đang cập nhật...' : plan.isActive ? 'Tạm dừng gói' : 'Mở lại gói'}
        </Button>
      </div>
    </article>
  )
}



