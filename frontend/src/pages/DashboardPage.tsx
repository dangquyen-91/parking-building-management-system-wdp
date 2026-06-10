import { useEffect, useMemo, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge, formatAdminCurrency } from '../components/admin'
import { adminApi, type AdminDashboardReport } from '../services/adminApi'

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
    sessions: 0,
    plans: 0,
  })
  const [report, setReport] = useState<AdminDashboardReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadAdminData() {
      try {
        setIsLoading(true)
        setError('')

        const [
          users,
          buildings,
          floors,
          slots,
          rows,
          bookings,
          subscriptions,
          sessions,
          plans,
          dashboardReport,
        ] = await Promise.all([
          adminApi.getUsers({ limit: 100, sort: 'createdAt', order: 'desc' }),
          adminApi.getBuildings({ limit: 100, sort: 'name', order: 'asc' }),
          adminApi.getFloors({ limit: 200, sort: 'floorNumber', order: 'asc' }),
          adminApi.getSlots({ limit: 200, sortBy: 'slotCode', sortOrder: 'asc' }),
          adminApi.getRows({ limit: 200, sortBy: 'rowCode', sortOrder: 'asc' }),
          adminApi.getBookings({ limit: 100 }),
          adminApi.getSubscriptions({ limit: 100 }),
          adminApi.getSessions({ limit: 100 }),
          adminApi.getPlans(),
          adminApi.getDashboardReport(),
        ])

        if (ignore) return

        setSummary({
          users: users.total,
          activeUsers: users.users.filter((user) => user.isActive).length,
          buildings: buildings.total,
          floors: floors.total,
          slots: slots.total,
          rows: rows.total,
          bookings: bookings.total,
          subscriptions: subscriptions.total,
          sessions: sessions.total,
          plans: plans.plans.length,
        })
        setReport(dashboardReport)
      } catch (loadError) {
        if (!ignore) setError(loadError instanceof Error ? loadError.message : 'Không thể tải dữ liệu admin')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadAdminData()

    return () => {
      ignore = true
    }
  }, [])

  const adminScope = useMemo(
    () => [
      { title: 'Người dùng', detail: `${summary.users} tài khoản trên mọi vai trò`, status: summary.activeUsers > 0 ? 'active' : 'inactive' },
      { title: 'Tòa nhà và tầng', detail: `${summary.buildings} tòa nhà / ${summary.floors} tầng`, status: summary.floors > 0 ? 'enabled' : 'warning' },
      { title: 'Chỗ đỗ', detail: `${summary.slots} ô tô / ${summary.rows} hàng xe máy`, status: summary.slots + summary.rows > 0 ? 'available' : 'warning' },
      { title: 'Doanh thu', detail: `${summary.bookings} đặt chỗ / ${summary.subscriptions} gói cư dân / ${summary.plans} gói giá`, status: summary.plans > 0 ? 'paid' : 'warning' },
    ] as const,
    [summary],
  )

  return (
    <AdminPageShell
      eyebrow="Admin // Tổng quan"
      title="Quản trị hệ thống"
      description="Quản lý tài khoản, phân quyền, cấu hình hệ thống và nhật ký vận hành cho toàn bộ nền tảng bãi đỗ."
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Doanh thu hôm nay" value={isLoading ? '-' : formatAdminCurrency(report?.revenueToday.total ?? 0)} detail="Đặt chỗ, gói cư dân và phiên gửi xe" />
        <AdminStatCard label="Công suất" value={isLoading ? '-' : `${report?.occupancy.currentVehicles ?? 0}/${report?.occupancy.totalCapacity ?? 0}`} detail={`${report?.occupancy.utilizationPercent ?? 0}% sử dụng`} />
        <AdminStatCard label="Tài khoản hoạt động" value={isLoading ? '-' : summary.activeUsers} detail={`${summary.users} tài khoản tổng cộng`} />
        <AdminStatCard label="Phiên đang hoạt động" value={isLoading ? '-' : report?.activity.activeSessions ?? 0} detail={`${report?.activity.checkinsToday ?? 0} lượt vào hôm nay`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Phạm vi admin</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Admin đang quản lý những gì?</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {adminScope.map((control) => (
              <article key={control.title} className="rounded-lg border border-theme bg-badge p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fg">{control.title}</p>
                    <p className="mt-2 text-sm text-muted">{control.detail}</p>
                  </div>
                  <AdminStatusBadge status={control.status} />
                </div>
                <p className="mt-4 text-xs text-subtle">Nguồn: API thực tế</p>
              </article>
            ))}
          </div>
        </section>

        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Vận hành</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Hoạt động gần đây</h2>
          </div>

          <div className="grid gap-2">
            {[
              ['Đặt chỗ chờ xử lý', report?.activity.pendingBookings ?? 0, 'pending'],
              ['Gói cư dân đang hoạt động', report?.activity.activeSubscriptions ?? 0, 'active'],
              ['Lượt xe ra hôm nay', report?.activity.checkoutsToday ?? 0, 'paid'],
            ].map(([label, value, status]) => (
              <div key={label} className="rounded-lg border border-theme bg-badge p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fg">{label}</p>
                    <p className="mt-1 text-xs text-subtle">{isLoading ? '-' : value}</p>
                  </div>
                  <AdminStatusBadge status={status as 'pending' | 'active' | 'paid'} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Doanh thu</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Chi tiết hôm nay</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Gói cư dân" value={isLoading ? '-' : formatAdminCurrency(report?.revenueToday.subscription ?? 0)} detail="Gói đã thanh toán" />
          <AdminStatCard label="Đặt chỗ" value={isLoading ? '-' : formatAdminCurrency(report?.revenueToday.booking ?? 0)} detail="Đặt chỗ vãng lai đã thanh toán" />
          <AdminStatCard label="Chuyển khoản tại cổng" value={isLoading ? '-' : formatAdminCurrency(report?.revenueToday.sessionTransfer ?? 0)} detail="Thanh toán chuyển khoản" />
          <AdminStatCard label="Tiền mặt tại cổng" value={isLoading ? '-' : formatAdminCurrency(report?.revenueToday.sessionCash ?? 0)} detail="Thanh toán tiền mặt" />
        </div>
      </section>
    </AdminPageShell>
  )
}
