import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ManagerOverviewActivity,
  ManagerOverviewAlerts,
  ManagerOverviewBookings,
  ManagerOverviewCapacity,
  ManagerOverviewQuickLinks,
  type ManagerOverviewAlert,
} from '../../components/manager/ManagerOverviewPanels'
import { ManagerPageHeader, ManagerStatCard, formatCurrency } from '../../components/manager'
import { managerBookingsApi, type ManagerBooking } from '../../services/managerBookingsApi'
import { managerGateLogsApi } from '../../services/managerGateLogsApi'
import {
  managerReportsApi,
  type ManagerDashboardReport,
  type ManagerOccupancyReport,
} from '../../services/managerReportsApi'
import { managerStaffApi, type ManagerStaffUser } from '../../services/managerStaffApi'
import type { GateSession } from '../../services/staffGateApi'

export function ManagerDashboardPage() {
  const [dashboard, setDashboard] = useState<ManagerDashboardReport | null>(null)
  const [occupancy, setOccupancy] = useState<ManagerOccupancyReport | null>(null)
  const [sessions, setSessions] = useState<GateSession[]>([])
  const [bookings, setBookings] = useState<ManagerBooking[]>([])
  const [staff, setStaff] = useState<ManagerStaffUser[]>([])
  const [snapshotTime, setSnapshotTime] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOverview = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const [dashboardData, occupancyData, sessionData, bookingData, staffData] = await Promise.all([
        managerReportsApi.getDashboard(),
        managerReportsApi.getOccupancy(),
        managerGateLogsApi.getActiveSessions({ page: 1, limit: 5 }),
        managerBookingsApi.getBookings({ status: 'paid', page: 1, limit: 5 }),
        managerStaffApi.getStaff(),
      ])

      setDashboard(dashboardData)
      setOccupancy(occupancyData)
      setSessions(sessionData.sessions)
      setBookings(bookingData.bookings)
      setStaff(staffData.users)
      setSnapshotTime(Date.now())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu tổng quan.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadOverview(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadOverview])

  const alerts = useMemo<ManagerOverviewAlert[]>(() => {
    const result: ManagerOverviewAlert[] = []

    occupancy?.floors.forEach((floor) => {
      const location = `${floor.building?.name ?? 'Tòa nhà'} · Tầng ${floor.floorNumber}`

      if (floor.utilizationPercent >= 90) {
        result.push({
          id: `capacity-${floor.floorId}`,
          title: `${location} gần đầy`,
          detail: `Đã sử dụng ${floor.utilizationPercent}% công suất, còn ${floor.empty} vị trí trống.`,
          to: '/manager/slots',
          tone: 'occupied',
        })
      }

      if ((floor.maintenance ?? 0) > 0) {
        result.push({
          id: `maintenance-${floor.floorId}`,
          title: `${location} có vị trí bảo trì`,
          detail: `${floor.maintenance} vị trí đang không thể sử dụng.`,
          to: '/manager/slots',
          tone: 'maintenance',
        })
      }
    })

    const longStayCount = sessions.filter(
      (session) => snapshotTime - new Date(session.entryTime).getTime() >= 24 * 60 * 60 * 1000,
    ).length

    if (longStayCount > 0) {
      result.push({
        id: 'long-stay',
        title: 'Có xe ở trong bãi quá 24 giờ',
        detail: `${longStayCount} xe cần được kiểm tra.`,
        to: '/manager/gate-logs',
        tone: 'pending',
      })
    }

    if ((dashboard?.activity.pendingBookings ?? 0) > 0) {
      result.push({
        id: 'pending-bookings',
        title: 'Có booking đang chờ xử lý',
        detail: `${dashboard?.activity.pendingBookings ?? 0} booking đang chờ thanh toán hoặc sử dụng.`,
        to: '/manager/bookings',
        tone: 'pending',
      })
    }

    return result
  }, [dashboard, occupancy, sessions, snapshotTime])

  const activeStaff = staff.filter((item) => item.isActive).length
  const availableSlots = Math.max(0, (occupancy?.overall.totalCapacity ?? 0) - (occupancy?.overall.occupied ?? 0))

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Manager // Tổng quan"
        title="Tổng quan vận hành"
        description="Theo dõi nhanh tình trạng bãi xe, hoạt động hôm nay và các vấn đề cần xử lý."
        actions={
          <button
            type="button"
            disabled={loading}
            onClick={() => void loadOverview()}
            className="rounded-lg border border-theme px-4 py-2.5 text-sm font-semibold text-fg hover:bg-ghost disabled:opacity-50"
          >
            {loading ? 'Đang tải...' : 'Làm mới dữ liệu'}
          </button>
        }
      />

      {error && (
        <div className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ManagerStatCard
          label="Xe đang trong bãi"
          value={dashboard?.activity.activeSessions ?? '...'}
          detail={`${availableSlots} vị trí còn trống`}
        />
        <ManagerStatCard
          label="Hoạt động hôm nay"
          value={`${dashboard?.activity.checkinsToday ?? 0}/${dashboard?.activity.checkoutsToday ?? 0}`}
          detail="Lượt xe vào / lượt xe ra"
        />
        <ManagerStatCard
          label="Doanh thu hôm nay"
          value={dashboard ? formatCurrency(dashboard.revenueToday.total) : '...'}
          detail={`Tiền mặt ${formatCurrency(dashboard?.revenueToday.sessionCash ?? 0)}`}
        />
        <ManagerStatCard
          label="Nhân viên hoạt động"
          value={`${activeStaff}/${staff.length}`}
          detail={`${dashboard?.activity.pendingBookings ?? 0} booking đang chờ`}
        />
      </div>

      <div className="mt-5">
        <ManagerOverviewQuickLinks />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <ManagerOverviewCapacity floors={occupancy?.floors ?? []} />
        <ManagerOverviewAlerts alerts={alerts} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <ManagerOverviewActivity sessions={sessions} />
        <ManagerOverviewBookings bookings={bookings} />
      </div>
    </div>
  )
}
