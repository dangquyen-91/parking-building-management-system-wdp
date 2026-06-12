import { useCallback, useEffect, useMemo, useState } from 'react'
import { AdminPageShell, AdminStatCard, formatAdminCurrency } from '../components/admin'
import { ManagerOccupancyTable } from '../components/manager/ManagerOccupancyTable'
import {
  ManagerPeakHoursChart,
  ManagerRevenueChart,
  ManagerSessionChart,
} from '../components/manager/ManagerReportCharts'
import { ManagerReportFilters } from '../components/manager/ManagerReportFilters'
import {
  adminApi,
  type AdminDashboardReport,
  type AdminOccupancyReport,
  type AdminPeakHoursReport,
  type AdminRevenueReport,
  type AdminSessionStatsReport,
} from '../services/adminApi'
import type {
  ManagerOccupancyReport,
  ManagerPeakHoursReport,
  ManagerRevenueReport,
  ManagerSessionReport,
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

function adaptRevenue(report: AdminRevenueReport): ManagerRevenueReport {
  return report
}

function adaptSessions(report: AdminSessionStatsReport): ManagerSessionReport {
  return {
    ...report,
    byVehicleType: {
      motorcycle: report.byVehicleType.motorcycle ?? 0,
      car: report.byVehicleType.car ?? 0,
    },
    byCustomerType: {
      walk_in: report.byCustomerType.walk_in ?? 0,
      resident: report.byCustomerType.resident ?? 0,
    },
  }
}

function adaptOccupancy(report: AdminOccupancyReport): ManagerOccupancyReport {
  return report as ManagerOccupancyReport
}

function adaptPeakHours(report: AdminPeakHoursReport): ManagerPeakHoursReport {
  return report
}

export function AdminReportsPage() {
  const [from, setFrom] = useState(sevenDaysAgo)
  const [to, setTo] = useState(today)
  const [peakDays, setPeakDays] = useState(7)
  const [filters, setFilters] = useState<ReportFilters>({ from: sevenDaysAgo, to: today, peakDays: 7 })
  const [dashboard, setDashboard] = useState<AdminDashboardReport | null>(null)
  const [occupancy, setOccupancy] = useState<AdminOccupancyReport | null>(null)
  const [revenue, setRevenue] = useState<AdminRevenueReport | null>(null)
  const [sessions, setSessions] = useState<AdminSessionStatsReport | null>(null)
  const [peakHours, setPeakHours] = useState<AdminPeakHoursReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadReports = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const [dashboardReport, occupancyReport, revenueReport, sessionReport, peakHourReport] = await Promise.all([
        adminApi.getDashboardReport(),
        adminApi.getOccupancyReport(),
        adminApi.getRevenueReport({ from: filters.from, to: filters.to }),
        adminApi.getSessionStatsReport({ from: filters.from, to: filters.to }),
        adminApi.getPeakHoursReport({ days: filters.peakDays }),
      ])

      setDashboard(dashboardReport)
      setOccupancy(occupancyReport)
      setRevenue(revenueReport)
      setSessions(sessionReport)
      setPeakHours(peakHourReport)
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải báo cáo admin.')
    } finally {
      setIsLoading(false)
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

  const busiestFloors = useMemo(() => {
    return [...(occupancy?.floors ?? [])]
      .sort((a, b) => b.utilizationPercent - a.utilizationPercent)
      .slice(0, 4)
  }, [occupancy])

  return (
    <AdminPageShell
      eyebrow="Admin // Báo cáo"
      title="Báo cáo thống kê"
      description="Theo dõi doanh thu, lượt xe, giờ cao điểm và công suất sử dụng trên toàn hệ thống bằng dữ liệu vận hành thực tế."
    >
      <ManagerReportFilters
        from={from}
        to={to}
        peakDays={peakDays}
        loading={isLoading}
        onFromChange={setFrom}
        onToChange={setTo}
        onPeakDaysChange={setPeakDays}
        onApply={applyFilters}
      />

      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">
          <span>{error}</span>
          <button type="button" className="font-semibold underline" onClick={() => void loadReports()}>
            Thử lại
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Doanh thu trong kỳ"
          value={revenue ? formatAdminCurrency(revenue.totals.total) : isLoading ? '-' : '0 VND'}
          detail={`${revenue?.totals.transactions ?? 0} giao dịch đã thanh toán`}
        />
        <AdminStatCard
          label="Lượt xe trong kỳ"
          value={sessions?.totalSessions ?? (isLoading ? '-' : 0)}
          detail={`Vãng lai ${sessions?.byCustomerType.walk_in ?? 0} · Cư dân ${sessions?.byCustomerType.resident ?? 0}`}
        />
        <AdminStatCard
          label="Xe đang trong bãi"
          value={dashboard?.activity.activeSessions ?? (isLoading ? '-' : 0)}
          detail={`Vào hôm nay ${dashboard?.activity.checkinsToday ?? 0} · Ra ${dashboard?.activity.checkoutsToday ?? 0}`}
        />
        <AdminStatCard
          label="Công suất sử dụng"
          value={occupancy ? `${occupancy.overall.utilizationPercent}%` : isLoading ? '-' : '0%'}
          detail={`${occupancy?.overall.occupied ?? 0}/${occupancy?.overall.totalCapacity ?? 0} vị trí đang dùng`}
        />
      </div>

      {revenue && (
        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Doanh thu gói" value={formatAdminCurrency(revenue.totals.subscription)} detail="Thanh toán mua gói gửi xe" />
          <AdminStatCard label="Doanh thu booking" value={formatAdminCurrency(revenue.totals.booking)} detail="Thanh toán đặt chỗ trước" />
          <AdminStatCard label="Vãng lai chuyển khoản" value={formatAdminCurrency(revenue.totals.sessionTransfer)} detail="Phiên gửi xe thanh toán online" />
          <AdminStatCard label="Vãng lai tiền mặt" value={formatAdminCurrency(revenue.totals.sessionCash)} detail="Phiên gửi xe thu tại cổng" />
        </section>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {revenue && <ManagerRevenueChart report={adaptRevenue(revenue)} />}
        {sessions && <ManagerSessionChart report={adaptSessions(sessions)} />}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.3fr]">
        {peakHours && <ManagerPeakHoursChart report={adaptPeakHours(peakHours)} />}
        {occupancy && <ManagerOccupancyTable report={adaptOccupancy(occupancy)} />}
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Điểm nóng công suất</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Tầng sử dụng cao nhất</h2>
        </div>

        {busiestFloors.length === 0 ? (
          <p className="py-8 text-center text-sm text-subtle">Chưa có dữ liệu công suất.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {busiestFloors.map((floor) => (
              <article key={floor.floorId} className="rounded-lg border border-theme bg-badge p-4">
                <p className="text-sm font-semibold text-fg">
                  {floor.building?.name ?? 'Tòa nhà'} / Tầng {floor.floorNumber}
                </p>
                <p className="mt-1 text-xs text-subtle">{floor.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-page">
                  <div className="h-full rounded-full bg-btn-primary" style={{ width: `${Math.min(100, floor.utilizationPercent)}%` }} />
                </div>
                <p className="mt-2 text-xs text-muted">
                  {floor.utilizationPercent}% sử dụng · còn {floor.empty} vị trí
                </p>
              </article>
            ))}
          </div>
        )}
      </section>
    </AdminPageShell>
  )
}
