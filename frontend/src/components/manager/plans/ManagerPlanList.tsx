import type { ManagerPlan } from '../../../services/managerPlansApi'
import { ManagerPlanCard } from './ManagerPlanCard'

type ManagerPlanListProps = {
  plans: ManagerPlan[]
  isLoading: boolean
  updatingId: string | null
  onEdit: (plan: ManagerPlan) => void
  onToggle: (plan: ManagerPlan) => void
}

export function ManagerPlanList({
  plans,
  isLoading,
  updatingId,
  onEdit,
  onToggle,
}: ManagerPlanListProps) {
  if (isLoading) {
    return <div className="liquid-glass-card rounded-lg p-4 text-sm text-muted">Đang tải danh sách gói...</div>
  }

  if (plans.length === 0) {
    return <div className="liquid-glass-card rounded-lg p-4 text-sm text-muted">Không có gói nào phù hợp với bộ lọc.</div>
  }

  return (
    <section className="grid gap-4 md:grid-cols-2">
      {plans.map((plan) => (
        <ManagerPlanCard
          key={plan._id}
          plan={plan}
          isUpdating={updatingId === plan._id}
          onEdit={onEdit}
          onToggle={onToggle}
        />
      ))}
    </section>
  )
}
