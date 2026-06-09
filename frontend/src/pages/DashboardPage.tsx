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
        if (!ignore) setError(loadError instanceof Error ? loadError.message : 'Cannot load admin data')
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
      { title: 'Users', detail: `${summary.users} accounts across all roles`, status: summary.activeUsers > 0 ? 'active' : 'inactive' },
      { title: 'Buildings & floors', detail: `${summary.buildings} buildings / ${summary.floors} floors`, status: summary.floors > 0 ? 'enabled' : 'warning' },
      { title: 'Parking inventory', detail: `${summary.slots} car slots / ${summary.rows} motorcycle rows`, status: summary.slots + summary.rows > 0 ? 'available' : 'warning' },
      { title: 'Revenue objects', detail: `${summary.bookings} bookings / ${summary.subscriptions} subscriptions / ${summary.plans} plans`, status: summary.plans > 0 ? 'paid' : 'warning' },
    ] as const,
    [summary],
  )

  return (
    <AdminPageShell
      eyebrow="Admin // Dashboard"
      title="System Administration"
      description="Quan ly tai khoan, phan quyen, cau hinh he thong va nhat ky bao mat cho toan bo parking platform."
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Revenue today" value={isLoading ? '-' : formatAdminCurrency(report?.revenueToday.total ?? 0)} detail="Bookings, subscriptions and sessions" />
        <AdminStatCard label="Occupancy" value={isLoading ? '-' : `${report?.occupancy.currentVehicles ?? 0}/${report?.occupancy.totalCapacity ?? 0}`} detail={`${report?.occupancy.utilizationPercent ?? 0}% utilization`} />
        <AdminStatCard label="Active users" value={isLoading ? '-' : summary.activeUsers} detail={`${summary.users} total accounts`} />
        <AdminStatCard label="Active sessions" value={isLoading ? '-' : report?.activity.activeSessions ?? 0} detail={`${report?.activity.checkinsToday ?? 0} check-ins today`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Admin Scope</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Nen quan ly nhung gi?</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {adminScope.map((control) => (
              <article key={control.title} className="rounded-lg border border-theme bg-badge p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fg">{control.title}</p>
                    <p className="mt-2 text-sm text-muted">{control.detail}</p>
                  </div>
                  <AdminStatusBadge status={control.status} label={control.status} />
                </div>
                <p className="mt-4 text-xs text-subtle">Source: live API</p>
              </article>
            ))}
          </div>
        </section>

        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Security</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Operational Activity</h2>
          </div>

          <div className="grid gap-2">
            {[
              ['Pending bookings', report?.activity.pendingBookings ?? 0, 'pending'],
              ['Active subscriptions', report?.activity.activeSubscriptions ?? 0, 'active'],
              ['Checkouts today', report?.activity.checkoutsToday ?? 0, 'paid'],
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
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Revenue</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Today Breakdown</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <AdminStatCard label="Subscriptions" value={isLoading ? '-' : formatAdminCurrency(report?.revenueToday.subscription ?? 0)} detail="Paid plan purchases" />
          <AdminStatCard label="Bookings" value={isLoading ? '-' : formatAdminCurrency(report?.revenueToday.booking ?? 0)} detail="Paid visitor bookings" />
          <AdminStatCard label="Session transfer" value={isLoading ? '-' : formatAdminCurrency(report?.revenueToday.sessionTransfer ?? 0)} detail="Gate transfer payments" />
          <AdminStatCard label="Session cash" value={isLoading ? '-' : formatAdminCurrency(report?.revenueToday.sessionCash ?? 0)} detail="Gate cash payments" />
        </div>
      </section>
    </AdminPageShell>
  )
}
