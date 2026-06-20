import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell, AdminStatCard, AdminStatusBadge, formatAdminCurrency } from '../../components/admin'
import { adminApi, type AdminBooking, type AdminDashboardReport, type AdminOccupancyReport } from '../../services/adminApi'
import type { GateSession } from '../../services/staffGateApi'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
  }).format(new Date(value))
}

function vehicleLabel(value: 'car' | 'motorcycle') {
  return value === 'car' ? 'Ô tô' : 'Xe máy'
}

const adminLinks = [
  { to: '/admin/users', label: 'Người dùng', detail: 'Tài khoản, vai trò và trạng thái' },
  { to: '/admin/buildings', label: 'Hạ tầng', detail: 'Tòa nhà, tầng, ô đỗ và hàng xe' },
  { to: '/admin/bookings', label: 'Booking', detail: 'Theo dõi đặt chỗ vãng lai' },
  { to: '/admin/reports', label: 'Báo cáo', detail: 'Doanh thu, công suất và lưu lượng' },
]

export function DashboardPage() {
  const [summary, setSummary] = useState({
    users: 0,
    activeUsers: 0,
    buildings: 0,
    floors: 0,
    slots: 0,
    rows: 0,
    bookings: 0,
    subscriptions: 0,
    plans: 0,
  })
  const [report, setReport] = useState<AdminDashboardReport | null>(null)
  const [occupancy, setOccupancy] = useState<AdminOccupancyReport | null>(null)
  const [sessions, setSessions] = useState<GateSession[]>([])
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [snapshotTime, setSnapshotTime] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  const loadAdminData = useCallback(async () => {
    try {
      setIsLoading(true)
      setError('')

      const [
        users,
        buildings,
        floors,
        slots,
        rows,
        bookingsData,
        subscriptions,
        plans,
        dashboardReport,
        occupancyReport,
        sessionData,
        paidBookings,
      ] = await Promise.all([
        adminApi.getUsers({ limit: 100, sort: 'createdAt', order: 'desc' }),
        adminApi.getBuildings({ limit: 100, sort: 'name', order: 'asc' }),
        adminApi.getFloors({ limit: 200, sort: 'floorNumber', order: 'asc' }),
        adminApi.getSlots({ limit: 200, sortBy: 'slotCode', sortOrder: 'asc' }),
        adminApi.getRows({ limit: 200, sortBy: 'rowCode', sortOrder: 'asc' }),
        adminApi.getBookings({ limit: 100 }),
        adminApi.getSubscriptions({ limit: 100 }),
        adminApi.getPlans(),
        adminApi.getDashboardReport(),
        adminApi.getOccupancyReport(),
        adminApi.getSessions({ page: 1, limit: 5 }),
        adminApi.getBookings({ status: 'paid', page: 1, limit: 5 }),
      ])

      setSummary({
        users: users.total,
        activeUsers: users.users.filter((user) => user.isActive).length,
        buildings: buildings.total,
        floors: floors.total,
        slots: slots.total,
        rows: rows.total,
        bookings: bookingsData.total,
        subscriptions: subscriptions.total,
        plans: plans.plans.length,
      })
      setReport(dashboardReport)
      setOccupancy(occupancyReport)
      setSessions(sessionData.sessions)
      setBookings(paidBookings.bookings)
      setSnapshotTime(Date.now())
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu admin.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadAdminData(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadAdminData])

  const alerts = useMemo(() => {
    const result: Array<{ id: string; title: string; detail: string; to: string; tone: 'pending' | 'maintenance' | 'occupied' | 'warning' }> = []

    occupancy?.floors.forEach((floor) => {
      const location = `${floor.building?.name ?? 'Tòa nhà'} / Tầng ${floor.floorNumber}`

      if (floor.utilizationPercent >= 90) {
        result.push({
          id: `capacity-${floor.floorId}`,
          title: `${location} gần đầy`,
          detail: `Đã sử dụng ${floor.utilizationPercent}% công suất, còn ${floor.empty} vị trí trống.`,
          to: '/admin/slots',
          tone: 'occupied',
        })
      }

      if ((floor.maintenance ?? 0) > 0) {
        result.push({
          id: `maintenance-${floor.floorId}`,
          title: `${location} có vị trí bảo trì`,
          detail: `${floor.maintenance} vị trí đang không thể sử dụng.`,
          to: '/admin/slots',
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
        detail: `${longStayCount} phiên cần được kiểm tra.`,
        to: '/admin/gate-logs',
        tone: 'warning',
      })
    }

    if ((report?.activity.pendingBookings ?? 0) > 0) {
      result.push({
        id: 'pending-bookings',
        title: 'Có booking đang chờ thanh toán',
        detail: `${report?.activity.pendingBookings ?? 0} booking vẫn ở trạng thái pending.`,
        to: '/admin/bookings',
        tone: 'pending',
      })
    }

    return result
  }, [occupancy, report, sessions, snapshotTime])

  const availableSlots = Math.max(0, (occupancy?.overall.totalCapacity ?? 0) - (occupancy?.overall.occupied ?? 0))

  return (
    <AdminPageShell
      eyebrow="Admin // Tổng quan"
      title="Quản trị hệ thống"
      description="Theo dõi nhanh sức khỏe nền tảng, doanh thu, công suất bãi xe và các điểm cần xử lý trên toàn hệ thống."
      actions={
        <button
          type="button"
          disabled={isLoading}
          onClick={() => void loadAdminData()}
          className="rounded-lg border border-theme px-4 py-2.5 text-sm font-semibold text-fg hover:bg-ghost disabled:opacity-50"
        >
          {isLoading ? 'Đang tải...' : 'Làm mới dữ liệu'}
        </button>
      }
    >
      {error && (
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">
          <span>{error}</span>
          <button type="button" className="font-semibold underline" onClick={() => void loadAdminData()}>
            Thử lại
          </button>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Doanh thu hôm nay"
          value={isLoading ? '-' : formatAdminCurrency(report?.revenueToday.total ?? 0)}
          detail={`Booking ${formatAdminCurrency(report?.revenueToday.booking ?? 0)}`}
        />
        <AdminStatCard
          label="Xe đang trong bãi"
          value={isLoading ? '-' : report?.activity.activeSessions ?? 0}
          detail={`${availableSlots} vị trí còn trống`}
        />
        <AdminStatCard
          label="Hoạt động hôm nay"
          value={isLoading ? '-' : `${report?.activity.checkinsToday ?? 0}/${report?.activity.checkoutsToday ?? 0}`}
          detail="Lượt xe vào / lượt xe ra"
        />
        <AdminStatCard
          label="Tài khoản hoạt động"
          value={isLoading ? '-' : `${summary.activeUsers}/${summary.users}`}
          detail={`${summary.buildings} tòa nhà / ${summary.floors} tầng`}
        />
      </div>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {adminLinks.map((item) => (
          <Link key={item.to} to={item.to} className="rounded-lg border border-theme bg-badge p-4 transition-colors hover:bg-ghost">
            <p className="text-sm font-semibold text-fg">{item.label}</p>
            <p className="mt-1 text-xs text-muted">{item.detail}</p>
          </Link>
        ))}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Công suất</p>
              <h2 className="mt-1 text-base font-semibold text-fg">Tình trạng từng tầng</h2>
            </div>
            <Link to="/admin/slots" className="text-xs font-semibold text-muted hover:text-fg">
              Quản lý chỗ đỗ
            </Link>
          </div>

          {(occupancy?.floors.length ?? 0) === 0 ? (
            <p className="py-8 text-center text-sm text-subtle">Chưa có dữ liệu tầng đỗ xe.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {(occupancy?.floors ?? []).slice(0, 6).map((floor) => (
                <article key={floor.floorId} className="rounded-lg border border-theme bg-badge p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-fg">
                        {floor.building?.name ?? 'Chưa xác định'} / Tầng {floor.floorNumber}
                      </p>
                      <p className="mt-1 text-xs text-subtle">{vehicleLabel(floor.vehicleType)}</p>
                    </div>
                    <AdminStatusBadge
                      status={floor.utilizationPercent >= 90 ? 'occupied' : 'available'}
                      label={`${floor.utilizationPercent}%`}
                    />
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-page">
                    <div
                      className="h-full rounded-full bg-btn-primary"
                      style={{ width: `${Math.min(100, floor.utilizationPercent)}%` }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-muted">
                    Đang đỗ {floor.occupied} · Còn trống {floor.empty} · Bảo trì {floor.maintenance ?? 0}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Cần chú ý</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Cảnh báo hệ thống</h2>
          </div>

          {alerts.length === 0 ? (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-200">
              Chưa phát hiện vấn đề cần xử lý.
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 6).map((alert) => (
                <Link key={alert.id} to={alert.to} className="block rounded-lg border border-theme bg-badge p-3 hover:bg-ghost">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-fg">{alert.title}</p>
                      <p className="mt-1 text-xs text-muted">{alert.detail}</p>
                    </div>
                    <AdminStatusBadge status={alert.tone} label="Kiểm tra" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Hoạt động cổng</p>
              <h2 className="mt-1 text-base font-semibold text-fg">Xe vừa vào bãi</h2>
            </div>
            <Link to="/admin/gate-logs" className="text-xs font-semibold text-muted hover:text-fg">
              Xem tất cả
            </Link>
          </div>

          {sessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-subtle">Hiện không có xe trong bãi.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <article key={session._id} className="flex items-center justify-between gap-3 rounded-lg border border-theme bg-badge p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-fg">{session.licensePlate}</p>
                    <p className="mt-1 text-xs text-subtle">
                      {vehicleLabel(session.vehicleType)} · Vào {formatDateTime(session.entryTime)}
                    </p>
                  </div>
                  <AdminStatusBadge status="active" label="Trong bãi" />
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Booking sắp đến</p>
              <h2 className="mt-1 text-base font-semibold text-fg">Đã thanh toán, chưa sử dụng</h2>
            </div>
            <Link to="/admin/bookings" className="text-xs font-semibold text-muted hover:text-fg">
              Quản lý booking
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-subtle">Không có booking đang chờ sử dụng.</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((booking) => (
                <article key={booking._id} className="flex items-center justify-between gap-3 rounded-lg border border-theme bg-badge p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-fg">{booking.licensePlate}</p>
                    <p className="mt-1 text-xs text-subtle">Dự kiến đến {formatDateTime(booking.expectedArrivalTime)}</p>
                  </div>
                  <AdminStatusBadge status="paid" label="Đã thanh toán" />
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Phạm vi quản trị</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Tài nguyên hệ thống</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Chỗ đỗ ô tô" value={summary.slots} detail={`${summary.rows} hàng xe máy đang cấu hình`} />
          <AdminStatCard label="Booking" value={summary.bookings} detail={`${report?.activity.pendingBookings ?? 0} booking đang pending`} />
          <AdminStatCard label="Gói cư dân" value={summary.subscriptions} detail={`${report?.activity.activeSubscriptions ?? 0} gói đang hoạt động`} />
          <AdminStatCard label="Gói giá" value={summary.plans} detail="Các plan có trong hệ thống" />
        </div>
      </section>
    </AdminPageShell>
  )
}
