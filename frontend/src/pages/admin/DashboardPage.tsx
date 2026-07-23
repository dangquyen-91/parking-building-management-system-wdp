import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AdminPageShell, AdminStatCard, AdminStatusBadge, formatAdminCurrency } from '../../components/admin'
import { adminApi, type AdminBooking, type AdminDashboardReport, type AdminOccupancyReport } from '../../services/adminApi'
import { formatFloorLabel } from '../../utils/floorLabel'
import type { GateSession } from '../../services/staffGateApi'
import { ArrowRight, RefreshCw } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Progress } from '../../components/ui/progress'
import { Card, CardContent } from '../../components/ui/card'
import { Alert, AlertDescription } from '../../components/ui/alert'

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

const quickLinkStyles = [
  {
    glow: 'from-violet-500/20',
    icon: 'bg-violet-500 text-white shadow-violet-500/30',
    arrow: 'text-violet-500',
  },
  {
    glow: 'from-sky-500/20',
    icon: 'bg-sky-500 text-white shadow-sky-500/30',
    arrow: 'text-sky-500',
  },
  {
    glow: 'from-emerald-500/20',
    icon: 'bg-emerald-500 text-white shadow-emerald-500/30',
    arrow: 'text-emerald-500',
  },
  {
    glow: 'from-amber-500/20',
    icon: 'bg-amber-500 text-white shadow-amber-500/30',
    arrow: 'text-amber-500',
  },
] as const

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

      const userRows = users.users ?? []
      setSummary({
        users: users.total ?? userRows.length,
        activeUsers: userRows.filter((user) => user.isActive).length,
        buildings: buildings.total ?? buildings.buildings?.length ?? 0,
        floors: floors.total ?? floors.floors?.length ?? 0,
        slots: slots.total ?? slots.slots?.length ?? 0,
        rows: rows.total ?? rows.rows?.length ?? 0,
        bookings: bookingsData.total ?? bookingsData.bookings?.length ?? 0,
        subscriptions: subscriptions.total ?? subscriptions.subscriptions?.length ?? 0,
        plans: plans.plans?.length ?? 0,
      })
      setReport(dashboardReport)
      setOccupancy(occupancyReport)
      setSessions(sessionData.sessions ?? [])
      setBookings(paidBookings.bookings ?? [])
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

    ;(occupancy?.floors ?? []).forEach((floor) => {
      const location = `${floor.building?.name ?? 'Tòa nhà'} / ${formatFloorLabel(floor)}`

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
        <Button
          type="button"
          variant="outline"
          disabled={isLoading}
          onClick={() => void loadAdminData()}
        >
          <RefreshCw className={`size-4 ${isLoading ? 'animate-spin' : ''}`} />
          {isLoading ? 'Đang tải...' : 'Làm mới dữ liệu'}
        </Button>
      }
    >
      {error && (
        <Alert variant="destructive" className="mb-5 flex items-center justify-between">
          <AlertDescription>{error}</AlertDescription>
          <Button type="button" variant="link" className="h-auto p-0" onClick={() => void loadAdminData()}>
            Thử lại
          </Button>
        </Alert>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard
          label="Doanh thu hôm nay"
          value={isLoading ? '-' : formatAdminCurrency(report?.revenueToday.total ?? 0)}
          detail={`Booking ${formatAdminCurrency(report?.revenueToday.booking ?? 0)}`}
          tone="amber"
        />
        <AdminStatCard
          label="Xe đang trong bãi"
          value={isLoading ? '-' : report?.activity.activeSessions ?? 0}
          detail={`${availableSlots} vị trí còn trống`}
          tone="sky"
        />
        <AdminStatCard
          label="Hoạt động hôm nay"
          value={isLoading ? '-' : `${report?.activity.checkinsToday ?? 0}/${report?.activity.checkoutsToday ?? 0}`}
          detail="Lượt xe vào / lượt xe ra"
          tone="emerald"
        />
        <AdminStatCard
          label="Tài khoản hoạt động"
          value={isLoading ? '-' : `${summary.activeUsers}/${summary.users}`}
          detail={`${summary.buildings} tòa nhà / ${summary.floors} tầng`}
          tone="violet"
        />
      </div>

      <section className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {adminLinks.map((item, index) => {
          const styles = quickLinkStyles[index]
          return (
          <Card key={item.to} className={`overflow-hidden bg-gradient-to-br ${styles.glow} via-card to-card transition-shadow hover:shadow-md`}><Link
            to={item.to}
            className="group block p-4"
          >
            <div className="relative flex items-center gap-3">
              <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-sm font-black shadow-lg ${styles.icon}`}>
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-foreground">{item.label}</span>
                <span className="mt-1 block line-clamp-1 text-xs text-muted-foreground">{item.detail}</span>
              </span>
              <ArrowRight className={`size-4 transition-transform group-hover:translate-x-1 ${styles.arrow}`} />
            </div>
          </Link></Card>
          )
        })}
      </section>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.4fr_1fr]">
        <Card className="relative overflow-hidden p-4 md:p-5">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" />
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Công suất</p>
              <h2 className="mt-1 text-base font-semibold text-foreground">Tình trạng từng tầng</h2>
            </div>
            <Link to="/admin/slots" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              Quản lý chỗ đỗ
            </Link>
          </div>

          {(occupancy?.floors.length ?? 0) === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Chưa có dữ liệu tầng đỗ xe.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {(occupancy?.floors ?? []).slice(0, 6).map((floor) => (
                <Card key={floor.floorId} className="shadow-none"><CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">
                        {floor.building?.name ?? 'Chưa xác định'} / {formatFloorLabel(floor)}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">{vehicleLabel(floor.vehicleType)}</p>
                    </div>
                    <AdminStatusBadge
                      status={floor.utilizationPercent >= 90 ? 'occupied' : 'available'}
                      label={`${floor.utilizationPercent}%`}
                    />
                  </div>
                  <Progress value={Math.min(100, floor.utilizationPercent)} className="mt-4 h-2" />
                  <p className="mt-2 text-xs text-muted-foreground">
                    Đang đỗ {floor.occupied} · Còn trống {floor.empty} · Bảo trì {floor.maintenance ?? 0}
                  </p>
                </CardContent></Card>
              ))}
            </div>
          )}
        </Card>

        <Card className="relative overflow-hidden p-4 md:p-5">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500" />
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Cần chú ý</p>
            <h2 className="mt-1 text-base font-semibold text-foreground">Cảnh báo hệ thống</h2>
          </div>

          {alerts.length === 0 ? (
            <Alert><AlertDescription>Chưa phát hiện vấn đề cần xử lý.</AlertDescription></Alert>
          ) : (
            <div className="space-y-2">
              {alerts.slice(0, 6).map((alert) => (
                <Card key={alert.id} className="shadow-none"><Link to={alert.to} className="block p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{alert.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{alert.detail}</p>
                    </div>
                    <AdminStatusBadge status={alert.tone} label="Kiểm tra" />
                  </div>
                </Link></Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-2">
        <Card className="relative overflow-hidden p-4 md:p-5">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-emerald-500 to-cyan-400" />
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Hoạt động cổng</p>
              <h2 className="mt-1 text-base font-semibold text-foreground">Xe vừa vào bãi</h2>
            </div>
            <Link to="/admin/gate-logs" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              Xem tất cả
            </Link>
          </div>

          {sessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Hiện không có xe trong bãi.</p>
          ) : (
            <div className="space-y-2">
              {sessions.map((session) => (
                <Card key={session._id} className="shadow-none"><CardContent className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{session.licensePlate}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {vehicleLabel(session.vehicleType)} · Vào {formatDateTime(session.entryTime)}
                    </p>
                  </div>
                  <AdminStatusBadge status="active" label="Trong bãi" />
                </CardContent></Card>
              ))}
            </div>
          )}
        </Card>

        <Card className="relative overflow-hidden p-4 md:p-5">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Booking sắp đến</p>
              <h2 className="mt-1 text-base font-semibold text-foreground">Đã thanh toán, chưa sử dụng</h2>
            </div>
            <Link to="/admin/bookings" className="text-xs font-semibold text-muted-foreground hover:text-foreground">
              Quản lý booking
            </Link>
          </div>

          {bookings.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Không có booking đang chờ sử dụng.</p>
          ) : (
            <div className="space-y-2">
              {bookings.map((booking) => (
                <Card key={booking._id} className="shadow-none"><CardContent className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{booking.licensePlate}</p>
                    <p className="mt-1 text-xs text-muted-foreground">Dự kiến đến {formatDateTime(booking.expectedArrivalTime)}</p>
                  </div>
                  <AdminStatusBadge status="paid" label="Đã thanh toán" />
                </CardContent></Card>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card className="relative mt-5 overflow-hidden p-4 md:p-5">
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500" />
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Phạm vi quản trị</p>
          <h2 className="mt-1 text-base font-semibold text-foreground">Tài nguyên hệ thống</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Chỗ đỗ ô tô" value={summary.slots} detail={`${summary.rows} hàng xe máy đang cấu hình`} tone="sky" />
          <AdminStatCard label="Booking" value={summary.bookings} detail={`${report?.activity.pendingBookings ?? 0} booking đang pending`} tone="amber" />
          <AdminStatCard label="Gói cư dân" value={summary.subscriptions} detail={`${report?.activity.activeSubscriptions ?? 0} gói đang hoạt động`} tone="emerald" />
          <AdminStatCard label="Gói giá" value={summary.plans} detail="Các plan có trong hệ thống" tone="violet" />
        </div>
      </Card>
    </AdminPageShell>
  )
}

