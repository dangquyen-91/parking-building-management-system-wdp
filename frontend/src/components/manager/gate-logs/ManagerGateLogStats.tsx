import type { ManagerGateDashboard } from '../../../services/managerGateLogsApi'
import type { GateSession } from '../../../services/staffGateApi'
import { formatCurrency } from '../managerData'
import { ManagerStatCard } from '../common/ManagerStatCard'

type ManagerGateLogStatsProps = {
  dashboard: ManagerGateDashboard | null
  sessions: GateSession[]
  totalSessions: number
  isFiltered: boolean
  isLoading: boolean
}

export function ManagerGateLogStats({
  dashboard,
  sessions,
  totalSessions,
  isFiltered,
  isLoading,
}: ManagerGateLogStatsProps) {
  const activity = dashboard?.activity
  const motorcycleCount = sessions.filter((session) => session.vehicleType === 'motorcycle').length
  const carCount = sessions.filter((session) => session.vehicleType === 'car').length
  const residentCount = sessions.filter((session) => session.customerType === 'resident').length
  const walkInCount = sessions.filter((session) => session.customerType === 'walk_in').length
  const activeValue = isFiltered ? sessions.length : activity?.activeSessions ?? 0

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ManagerStatCard
        label="Đang trong bãi"
        value={isLoading ? '-' : activeValue}
        detail={isFiltered ? `Đang hiển thị trên ${totalSessions} phiên` : 'Phiên gửi xe đang hoạt động'}
        tone="emerald"
      />

      {isFiltered ? (
        <>
          <ManagerStatCard label="Xe máy" value={isLoading ? '-' : motorcycleCount} detail="Theo kết quả đang lọc" tone="sky" />
          <ManagerStatCard label="Ô tô" value={isLoading ? '-' : carCount} detail="Theo kết quả đang lọc" tone="violet" />
          <ManagerStatCard
            label="Cư dân / Vãng lai"
            value={isLoading ? '-' : `${residentCount}/${walkInCount}`}
            detail="Theo loại khách đang lọc"
            tone="amber"
          />
        </>
      ) : (
        <>
          <ManagerStatCard
            label="Xe vào hôm nay"
            value={isLoading ? '-' : activity?.checkinsToday ?? 0}
            detail="Tổng lượt check-in"
            tone="sky"
          />
          <ManagerStatCard
            label="Xe ra hôm nay"
            value={isLoading ? '-' : activity?.checkoutsToday ?? 0}
            detail="Tổng lượt check-out"
            tone="violet"
          />
          <ManagerStatCard
            label="Doanh thu hôm nay"
            value={isLoading ? '-' : formatCurrency(dashboard?.revenueToday.total ?? 0)}
            detail="Tất cả nguồn thanh toán"
            tone="amber"
          />
        </>
      )}
    </div>
  )
}
