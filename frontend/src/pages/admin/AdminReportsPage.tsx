import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AdminOccupancyTable,
  AdminPageShell,
  AdminPeakHoursChart,
  AdminReportFilters,
  AdminRevenueChart,
  AdminSessionChart,
  AdminStatCard,
  formatAdminCurrency,
} from '../../components/admin'
import {
  adminApi,
  type AdminDashboardReport,
  type AdminOccupancyReport,
  type AdminPeakHoursReport,
  type AdminRevenueReport,
  type AdminSessionStatsReport,
} from '../../services/adminApi'
import { formatFloorLabel } from '../../utils/floorLabel'

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
      .sort((a, b) => (b.utilizationPercent ?? 0) - (a.utilizationPercent ?? 0))
      .slice(0, 4)
  }, [occupancy])

  return (
    <AdminPageShell
      eyebrow="Admin // Báo cáo"
      title="Báo cáo thống kê"
      description="Theo dõi doanh thu, lượt xe, giờ cao điểm và công suất sử dụng trên toàn hệ thống bằng dữ liệu vận hành thực tế."
    >
      <AdminReportFilters
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
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">
          <span>{error}</span>
          <button type="button" className="font-semibold underline" onClick={() => void loadReports()}>
            Thử lại
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Doanh thu trong kỳ"
          value={revenue ? formatAdminCurrency(revenue.totals?.total ?? 0) : isLoading ? '-' : '0 VND'}
          detail={`${revenue?.totals?.transactions ?? 0} giao dịch đã thanh toán`}
          tone="amber"
        />
        <AdminStatCard
          label="Lượt xe trong kỳ"
          value={sessions?.totalSessions ?? (isLoading ? '-' : 0)}
          detail={`Vãng lai ${sessions?.byCustomerType?.walk_in ?? 0} · Cư dân ${sessions?.byCustomerType?.resident ?? 0}`}
          tone="sky"
        />
        <AdminStatCard
          label="Xe đang trong bãi"
          value={dashboard?.activity?.activeSessions ?? (isLoading ? '-' : 0)}
          detail={`Vào hôm nay ${dashboard?.activity?.checkinsToday ?? 0} · Ra ${dashboard?.activity?.checkoutsToday ?? 0}`}
          tone="emerald"
        />
        <AdminStatCard
          label="Công suất sử dụng"
          value={occupancy ? `${occupancy.overall?.utilizationPercent ?? 0}%` : isLoading ? '-' : '0%'}
          detail={`${occupancy?.overall?.occupied ?? 0}/${occupancy?.overall?.totalCapacity ?? 0} vị trí đang dùng`}
          tone="violet"
        />
      </div>

      {revenue?.totals && (
        <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Doanh thu gói" value={formatAdminCurrency(revenue.totals.subscription ?? 0)} detail="Thanh toán mua gói gửi xe" tone="violet" />
          <AdminStatCard label="Doanh thu booking" value={formatAdminCurrency(revenue.totals.booking ?? 0)} detail="Thanh toán đặt chỗ trước" tone="emerald" />
          <AdminStatCard label="Vãng lai chuyển khoản" value={formatAdminCurrency(revenue.totals.sessionTransfer ?? 0)} detail="Phiên gửi xe thanh toán online" tone="sky" />
          <AdminStatCard label="Vãng lai tiền mặt" value={formatAdminCurrency(revenue.totals.sessionCash ?? 0)} detail="Phiên gửi xe thu tại cổng" tone="amber" />
        </section>
      )}

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        {revenue && <AdminRevenueChart report={revenue} />}
        {sessions && <AdminSessionChart report={sessions} />}
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_1.3fr]">
        {peakHours && <AdminPeakHoursChart report={peakHours} />}
        {occupancy && <AdminOccupancyTable report={occupancy} />}
      </div>

      <section className="liquid-glass-card mt-5 rounded-2xl border border-amber-500/15 p-4 shadow-sm md:p-5">
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500" />
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-600 dark:text-amber-300">Điểm nóng công suất</p>
          <h2 className="mt-1 text-lg font-black text-fg">Tầng sử dụng cao nhất</h2>
        </div>

        {busiestFloors.length === 0 ? (
          <p className="py-8 text-center text-sm text-subtle">Chưa có dữ liệu công suất.</p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {busiestFloors.map((floor) => (
              <article key={floor.floorId} className="rounded-2xl border border-theme bg-badge p-4 transition-all hover:-translate-y-0.5 hover:border-amber-500/25 hover:bg-amber-500/5">
                <p className="text-sm font-black text-fg">
                  {floor.building?.name ?? 'Tòa nhà'} / {formatFloorLabel(floor)}
                </p>
                <p className="mt-1 text-xs text-subtle">{floor.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}</p>
                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-page">
                  <div className={`h-full rounded-full ${floor.utilizationPercent >= 90 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : 'bg-gradient-to-r from-sky-500 to-violet-500'}`} style={{ width: `${Math.min(100, floor.utilizationPercent)}%` }} />
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
