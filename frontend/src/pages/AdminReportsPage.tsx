import { useEffect, useMemo, useState } from 'react'
import { AdminPageShell, AdminStatCard, formatAdminCurrency } from '../components/admin'
import {
  adminApi,
  type AdminDashboardReport,
  type AdminOccupancyReport,
  type AdminPeakHoursReport,
  type AdminRevenueReport,
  type AdminSessionStatsReport,
} from '../services/adminApi'

const vehicleTypeLabels: Record<'car' | 'motorcycle', string> = {
  car: 'Ô tô',
  motorcycle: 'Xe máy',
}

const floorTypeLabels: Record<'resident' | 'visitor', string> = {
  resident: 'Cư dân',
  visitor: 'Khách vãng lai',
}

export function AdminReportsPage() {
  const [dashboard, setDashboard] = useState<AdminDashboardReport | null>(null)
  const [occupancy, setOccupancy] = useState<AdminOccupancyReport | null>(null)
  const [revenue, setRevenue] = useState<AdminRevenueReport | null>(null)
  const [sessions, setSessions] = useState<AdminSessionStatsReport | null>(null)
  const [peakHours, setPeakHours] = useState<AdminPeakHoursReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadReports() {
      try {
        setIsLoading(true)
        setError('')
        const [dashboardReport, occupancyReport, revenueReport, sessionReport, peakHourReport] = await Promise.all([
          adminApi.getDashboardReport(),
          adminApi.getOccupancyReport(),
          adminApi.getRevenueReport(),
          adminApi.getSessionStatsReport(),
          adminApi.getPeakHoursReport({ days: 7 }),
        ])

        if (!ignore) {
          setDashboard(dashboardReport)
          setOccupancy(occupancyReport)
          setRevenue(revenueReport)
          setSessions(sessionReport)
          setPeakHours(peakHourReport)
        }
      } catch (loadError) {
        if (!ignore) setError(loadError instanceof Error ? loadError.message : 'Không thể tải báo cáo')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadReports()

    return () => {
      ignore = true
    }
  }, [])

  const busiestFloors = useMemo(() => {
    return [...(occupancy?.floors ?? [])]
      .sort((a, b) => b.utilizationPercent - a.utilizationPercent)
      .slice(0, 5)
  }, [occupancy])

  return (
    <AdminPageShell
      eyebrow="Admin // Báo cáo"
      title="Báo cáo doanh thu và vận hành"
      description="Admin xem các báo cáo quản lý dùng để theo dõi doanh thu, công suất và lưu lượng xe."
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Doanh thu hôm nay" value={isLoading ? '-' : formatAdminCurrency(dashboard?.revenueToday.total ?? 0)} detail="Báo cáo dashboard" />
        <AdminStatCard label="Doanh thu 30 ngày" value={isLoading ? '-' : formatAdminCurrency(revenue?.totals.total ?? 0)} detail={`${revenue?.totals.transactions ?? 0} giao dịch`} />
        <AdminStatCard label="Phiên gửi xe" value={isLoading ? '-' : sessions?.totalSessions ?? 0} detail="Thống kê phiên gần đây" />
        <AdminStatCard label="Giờ cao điểm" value={isLoading ? '-' : `${peakHours?.peakHour.hour ?? 0}:00`} detail={`${peakHours?.peakHour.count ?? 0} lượt vào`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Công suất</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Tầng đông nhất</h2>
          </div>
          <div className="grid gap-3">
            {isLoading && <p className="text-sm text-muted">Đang tải công suất...</p>}
            {!isLoading && busiestFloors.length === 0 && <p className="text-sm text-muted">Không có dữ liệu công suất.</p>}
            {!isLoading && busiestFloors.map((floor) => (
              <article key={floor.floorId} className="rounded-lg border border-theme bg-badge p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-fg">{floor.building?.name ?? 'Tòa nhà'} / Tầng {floor.floorNumber}</p>
                    <p className="mt-1 text-xs text-subtle">{vehicleTypeLabels[floor.vehicleType]} / {floorTypeLabels[floor.floorType]}</p>
                  </div>
                  <p className="text-sm font-semibold text-fg">{floor.utilizationPercent}%</p>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-page">
                  <div className="h-full rounded-full bg-btn-primary" style={{ width: `${floor.utilizationPercent}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Doanh thu</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Chi tiết</h2>
          </div>
          <div className="grid gap-3">
            <AdminStatCard label="Gói cư dân" value={isLoading ? '-' : formatAdminCurrency(revenue?.totals.subscription ?? 0)} detail="Thanh toán gói" />
            <AdminStatCard label="Đặt chỗ" value={isLoading ? '-' : formatAdminCurrency(revenue?.totals.booking ?? 0)} detail="Đặt chỗ vãng lai" />
            <AdminStatCard label="Phiên tại cổng" value={isLoading ? '-' : formatAdminCurrency((revenue?.totals.sessionCash ?? 0) + (revenue?.totals.sessionTransfer ?? 0))} detail="Tiền mặt và chuyển khoản" />
          </div>
        </section>
      </div>
    </AdminPageShell>
  )
}
