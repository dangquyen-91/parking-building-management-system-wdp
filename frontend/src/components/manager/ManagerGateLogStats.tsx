import type { ManagerGateDashboard } from '../../services/managerGateLogsApi'
import { formatCurrency } from './managerData'
import { ManagerStatCard } from './ManagerStatCard'

type ManagerGateLogStatsProps = {
  dashboard: ManagerGateDashboard | null
  isLoading: boolean
}

export function ManagerGateLogStats({ dashboard, isLoading }: ManagerGateLogStatsProps) {
  const activity = dashboard?.activity

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ManagerStatCard
        label="Đang trong bãi"
        value={isLoading ? '-' : activity?.activeSessions ?? 0}
        detail="Phiên gửi xe đang hoạt động"
      />
      <ManagerStatCard
        label="Xe vào hôm nay"
        value={isLoading ? '-' : activity?.checkinsToday ?? 0}
        detail="Tổng lượt check-in"
      />
      <ManagerStatCard
        label="Xe ra hôm nay"
        value={isLoading ? '-' : activity?.checkoutsToday ?? 0}
        detail="Tổng lượt check-out"
      />
      <ManagerStatCard
        label="Doanh thu hôm nay"
        value={isLoading ? '-' : formatCurrency(dashboard?.revenueToday.total ?? 0)}
        detail="Tất cả nguồn thanh toán"
      />
    </div>
  )
}
