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
        if (!ignore) setError(loadError instanceof Error ? loadError.message : 'Cannot load reports')
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
      eyebrow="Admin // Reports"
      title="Revenue & Operations Report"
      description="Admin xem cac bao cao manager dung de theo doi doanh thu, cong suat va luu luong xe."
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Revenue today" value={isLoading ? '-' : formatAdminCurrency(dashboard?.revenueToday.total ?? 0)} detail="Dashboard report" />
        <AdminStatCard label="30-day revenue" value={isLoading ? '-' : formatAdminCurrency(revenue?.totals.total ?? 0)} detail={`${revenue?.totals.transactions ?? 0} transactions`} />
        <AdminStatCard label="Sessions" value={isLoading ? '-' : sessions?.totalSessions ?? 0} detail="Recent session stats" />
        <AdminStatCard label="Peak hour" value={isLoading ? '-' : `${peakHours?.peakHour.hour ?? 0}:00`} detail={`${peakHours?.peakHour.count ?? 0} entries`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Occupancy</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Busiest Floors</h2>
          </div>
          <div className="grid gap-3">
            {isLoading && <p className="text-sm text-muted">Loading occupancy...</p>}
            {!isLoading && busiestFloors.length === 0 && <p className="text-sm text-muted">No occupancy data.</p>}
            {!isLoading && busiestFloors.map((floor) => (
              <article key={floor.floorId} className="rounded-lg border border-theme bg-badge p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-fg">{floor.building?.name ?? 'Building'} / Floor {floor.floorNumber}</p>
                    <p className="mt-1 text-xs text-subtle">{floor.vehicleType} / {floor.floorType}</p>
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
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Revenue</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Breakdown</h2>
          </div>
          <div className="grid gap-3">
            <AdminStatCard label="Subscriptions" value={isLoading ? '-' : formatAdminCurrency(revenue?.totals.subscription ?? 0)} detail="Plan payments" />
            <AdminStatCard label="Bookings" value={isLoading ? '-' : formatAdminCurrency(revenue?.totals.booking ?? 0)} detail="Visitor bookings" />
            <AdminStatCard label="Gate sessions" value={isLoading ? '-' : formatAdminCurrency((revenue?.totals.sessionCash ?? 0) + (revenue?.totals.sessionTransfer ?? 0))} detail="Cash and transfer" />
          </div>
        </section>
      </div>
    </AdminPageShell>
  )
}
