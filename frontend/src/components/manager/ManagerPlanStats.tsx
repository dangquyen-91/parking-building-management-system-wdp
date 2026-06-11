import type { ManagerPlan } from '../../services/managerPlansApi'
import { ManagerStatCard } from './ManagerStatCard'

type ManagerPlanStatsProps = {
  plans: ManagerPlan[]
  isLoading: boolean
}

export function ManagerPlanStats({ plans, isLoading }: ManagerPlanStatsProps) {
  const activeCount = plans.filter((plan) => plan.isActive).length
  const carCount = plans.filter((plan) => plan.vehicleType === 'car').length
  const motorcycleCount = plans.filter((plan) => plan.vehicleType === 'motorcycle').length

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-3">
      <ManagerStatCard
        label="Đang mở bán"
        value={isLoading ? '-' : activeCount}
        detail={`Trên tổng ${plans.length} gói`}
      />
      <ManagerStatCard label="Gói ô tô" value={isLoading ? '-' : carCount} detail="Tất cả kỳ hạn" />
      <ManagerStatCard
        label="Gói xe máy"
        value={isLoading ? '-' : motorcycleCount}
        detail="Tất cả kỳ hạn"
      />
    </div>
  )
}
