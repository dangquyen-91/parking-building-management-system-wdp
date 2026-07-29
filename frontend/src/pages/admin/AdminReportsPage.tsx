import { useCallback, useEffect, useState } from 'react'
import {
  AdminOccupancyTable,
  AdminPeakHoursChart,
  AdminReportFilters,
  AdminReportHeader,
  AdminRevenueByVehicleChart,
  AdminRevenueChart,
  AdminSessionChart,
  AdminStatCard,
  formatAdminCurrency,
} from '../../components/admin'
import { Button } from '../../components/ui/button'
import {
  adminApi,
  type AdminDashboardReport,
  type AdminOccupancyReport,
  type AdminPeakHoursReport,
  type AdminRevenueByVehicleReport,
  type AdminRevenueReport,
  type AdminSessionStatsReport,
} from '../../services/adminApi'

function toDateInput(date: Date) {
  const offset = date.getTimezoneOffset()
  return new Date(date.getTime() - offset * 60_000).toISOString().slice(0, 10)
}

const today = toDateInput(new Date())
const sevenDaysAgo = toDateInput(
  new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
)

type AdminReportRange = {
  from: string
  to: string
}

function getDateRangeDays(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`).getTime()
  const end = new Date(`${to}T00:00:00`).getTime()
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 7
  return Math.max(1, Math.floor((end - start) / 86_400_000) + 1)
}

export function AdminReportsPage() {
  const [from, setFrom] = useState(sevenDaysAgo)
  const [to, setTo] = useState(today)
  const [filters, setFilters] = useState<AdminReportRange>({
    from: sevenDaysAgo,
    to: today,
  })
  const [dashboard, setDashboard] = useState<AdminDashboardReport | null>(null)
  const [revenue, setRevenue] = useState<AdminRevenueReport | null>(null)
  const [revenueByVehicle, setRevenueByVehicle] =
    useState<AdminRevenueByVehicleReport | null>(null)
  const [sessions, setSessions] = useState<AdminSessionStatsReport | null>(null)
  const [occupancy, setOccupancy] = useState<AdminOccupancyReport | null>(null)
  const [peakHours, setPeakHours] = useState<AdminPeakHoursReport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReports = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [
        dashboardData,
        revenueData,
        revenueByVehicleData,
        sessionData,
        occupancyData,
        peakHoursData,
      ] = await Promise.all([
        adminApi.getDashboardReport(),
        adminApi.getRevenueReport(filters),
        adminApi.getRevenueByVehicleReport(filters),
        adminApi.getSessionStatsReport(filters),
        adminApi.getOccupancyReport(),
        adminApi.getPeakHoursReport({
          days: getDateRangeDays(filters.from, filters.to),
        }),
      ])

      setDashboard(dashboardData)
      setRevenue(revenueData)
      setRevenueByVehicle(revenueByVehicleData)
      setSessions(sessionData)
      setOccupancy(occupancyData)
      setPeakHours(peakHoursData)
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : 'Không thể tải dữ liệu báo cáo.',
      )
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadReports(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadReports])

  const applyFilters = () => {
    if (from && to && from <= to) setFilters({ from, to })
  }

  return (
    <div className="relative mx-auto max-w-[118rem] p-4 md:p-8 lg:p-10">
      <AdminReportHeader
        eyebrow="Admin // Báo cáo"
        title="Báo cáo doanh thu & vận hành"
        description="Theo dõi doanh thu, lưu lượng xe, giờ cao điểm và công suất bãi đỗ từ dữ liệu thực tế."
      />

      <AdminReportFilters
        from={from}
        to={to}
        loading={loading}
        onFromChange={setFrom}
        onToChange={setTo}
        onApply={applyFilters}
      />

      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          <span>{error}</span>
          <Button
            type="button"
            className="font-semibold underline"
            onClick={() => void loadReports()}
          >
            Thử lại
          </Button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Doanh thu trong kỳ"
          value={revenue ? formatAdminCurrency(revenue.totals.total) : '...'}
          detail={`${revenue?.totals.transactions ?? 0} giao dịch đã thanh toán`}
        />
        <AdminStatCard
          label="Lượt xe trong kỳ"
          value={sessions?.totalSessions ?? '...'}
          detail={`Vãng lai ${sessions?.byCustomerType.walk_in ?? 0} · Cư dân ${sessions?.byCustomerType.resident ?? 0}`}
        />
        <AdminStatCard
          label="Xe đang trong bãi"
          value={dashboard?.activity.activeSessions ?? '...'}
          detail={`Vào hôm nay ${dashboard?.activity.checkinsToday ?? 0} · Ra ${dashboard?.activity.checkoutsToday ?? 0}`}
        />
        <AdminStatCard
          label="Công suất sử dụng"
          value={occupancy ? `${occupancy.overall.utilizationPercent}%` : '...'}
          detail={`${occupancy?.overall.occupied ?? 0}/${occupancy?.overall.totalCapacity ?? 0} vị trí đang dùng`}
        />
      </div>

      {revenue && (
        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard
            label="Doanh thu gói"
            value={formatAdminCurrency(revenue.totals.subscription)}
            detail="Thanh toán mua gói gửi xe"
          />
          <AdminStatCard
            label="Doanh thu booking"
            value={formatAdminCurrency(revenue.totals.booking)}
            detail="Thanh toán đặt chỗ trước"
          />
          <AdminStatCard
            label="Vãng lai chuyển khoản"
            value={formatAdminCurrency(revenue.totals.sessionTransfer)}
            detail="Phiên gửi xe thanh toán online"
          />
          <AdminStatCard
            label="Vãng lai tiền mặt"
            value={formatAdminCurrency(revenue.totals.sessionCash)}
            detail="Phiên gửi xe thu tại cổng"
          />
        </section>
      )}

      {revenueByVehicle && (
        <section className="mt-5 grid gap-3 sm:grid-cols-2">
          <AdminStatCard
            label="Doanh thu xe máy"
            value={formatAdminCurrency(
              revenueByVehicle.totals.motorcycle.total,
            )}
            detail={`${revenueByVehicle.totals.motorcycle.transactions} giao dịch`}
          />
          <AdminStatCard
            label="Doanh thu ô tô"
            value={formatAdminCurrency(revenueByVehicle.totals.car.total)}
            detail={`${revenueByVehicle.totals.car.transactions} giao dịch`}
          />
        </section>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {revenue && <AdminRevenueChart report={revenue} />}
        {sessions && <AdminSessionChart report={sessions} />}
      </div>

      {revenueByVehicle && (
        <div className="mt-5">
          <AdminRevenueByVehicleChart report={revenueByVehicle} />
        </div>
      )}

      <div className="mt-5">
        {peakHours && <AdminPeakHoursChart report={peakHours} />}
      </div>

      <div className="mt-5">
        {occupancy && <AdminOccupancyTable report={occupancy} />}
      </div>
    </div>
  )
}
