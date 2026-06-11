import { useCallback, useEffect, useState } from 'react'
import { ManagerOccupancyTable } from '../components/manager/ManagerOccupancyTable'
import {
  ManagerPeakHoursChart,
  ManagerRevenueChart,
  ManagerSessionChart,
} from '../components/manager/ManagerReportCharts'
import { ManagerReportFilters } from '../components/manager/ManagerReportFilters'
import { ManagerPageHeader, ManagerStatCard, formatCurrency } from '../components/manager'
import {
  managerReportsApi,
  type ManagerDashboardReport,
  type ManagerOccupancyReport,
  type ManagerPeakHoursReport,
  type ManagerRevenueReport,
  type ManagerSessionReport,
} from '../services/managerReportsApi'

function toDateInput(date: Date) {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

const today = toDateInput(new Date())
const sevenDaysAgo = toDateInput(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000))

type ReportFilters = {
  from: string
  to: string
  peakDays: number
}

export function ManagerReportsPage() {
  const [from, setFrom] = useState(sevenDaysAgo)
  const [to, setTo] = useState(today)
  const [peakDays, setPeakDays] = useState(7)
  const [filters, setFilters] = useState<ReportFilters>({ from: sevenDaysAgo, to: today, peakDays: 7 })
  const [dashboard, setDashboard] = useState<ManagerDashboardReport | null>(null)
  const [revenue, setRevenue] = useState<ManagerRevenueReport | null>(null)
  const [sessions, setSessions] = useState<ManagerSessionReport | null>(null)
  const [occupancy, setOccupancy] = useState<ManagerOccupancyReport | null>(null)
  const [peakHours, setPeakHours] = useState<ManagerPeakHoursReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [dashboardData, revenueData, sessionData, occupancyData, peakHoursData] = await Promise.all([
        managerReportsApi.getDashboard(),
        managerReportsApi.getRevenue({ from: filters.from, to: filters.to }),
        managerReportsApi.getSessions({ from: filters.from, to: filters.to }),
        managerReportsApi.getOccupancy(),
        managerReportsApi.getPeakHours(filters.peakDays),
      ])

      setDashboard(dashboardData)
      setRevenue(revenueData)
      setSessions(sessionData)
      setOccupancy(occupancyData)
      setPeakHours(peakHoursData)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu báo cáo.')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadReports(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadReports])

  const applyFilters = () => {
    if (from && to && from <= to) {
      setFilters({ from, to, peakDays })
    }
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Manager // Báo cáo"
        title="Báo cáo doanh thu & vận hành"
        description="Theo dõi doanh thu, lưu lượng xe, giờ cao điểm và công suất bãi đỗ từ dữ liệu thực tế."
      />

      <ManagerReportFilters
        from={from}
        to={to}
        peakDays={peakDays}
        loading={loading}
        onFromChange={setFrom}
        onToChange={setTo}
        onPeakDaysChange={setPeakDays}
        onApply={applyFilters}
      />

      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          <span>{error}</span>
          <button type="button" className="font-semibold underline" onClick={() => void loadReports()}>
            Thử lại
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ManagerStatCard
          label="Doanh thu trong kỳ"
          value={revenue ? formatCurrency(revenue.totals.total) : '...'}
          detail={`${revenue?.totals.transactions ?? 0} giao dịch đã thanh toán`}
        />
        <ManagerStatCard
          label="Lượt xe trong kỳ"
          value={sessions?.totalSessions ?? '...'}
          detail={`Vãng lai ${sessions?.byCustomerType.walk_in ?? 0} · Cư dân ${sessions?.byCustomerType.resident ?? 0}`}
        />
        <ManagerStatCard
          label="Xe đang trong bãi"
          value={dashboard?.activity.activeSessions ?? '...'}
          detail={`Vào hôm nay ${dashboard?.activity.checkinsToday ?? 0} · Ra ${dashboard?.activity.checkoutsToday ?? 0}`}
        />
        <ManagerStatCard
          label="Công suất sử dụng"
          value={occupancy ? `${occupancy.overall.utilizationPercent}%` : '...'}
          detail={`${occupancy?.overall.occupied ?? 0}/${occupancy?.overall.totalCapacity ?? 0} vị trí đang dùng`}
        />
      </div>

      {revenue && (
        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <ManagerStatCard label="Doanh thu gói" value={formatCurrency(revenue.totals.subscription)} detail="Thanh toán mua gói gửi xe" />
          <ManagerStatCard label="Doanh thu booking" value={formatCurrency(revenue.totals.booking)} detail="Thanh toán đặt chỗ trước" />
          <ManagerStatCard label="Vãng lai chuyển khoản" value={formatCurrency(revenue.totals.sessionTransfer)} detail="Phiên gửi xe thanh toán online" />
          <ManagerStatCard label="Vãng lai tiền mặt" value={formatCurrency(revenue.totals.sessionCash)} detail="Phiên gửi xe thu tại cổng" />
        </section>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {revenue && <ManagerRevenueChart report={revenue} />}
        {sessions && <ManagerSessionChart report={sessions} />}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.3fr]">
        {peakHours && <ManagerPeakHoursChart report={peakHours} />}
        {occupancy && <ManagerOccupancyTable report={occupancy} />}
      </div>
    </div>
  )
}
