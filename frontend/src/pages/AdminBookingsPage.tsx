import { useEffect, useMemo, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge, formatAdminCurrency } from '../components/admin'
import { adminApi, type AdminFloorDto, type AdminSessionDto } from '../services/adminApi'

function formatTime(value?: string) {
  if (!value) return '-'
  return new Date(value).toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getLocation(session: AdminSessionDto) {
  const place = session.slotId ?? session.rowId
  if (!place || typeof place === 'string') return '-'

  const floor = typeof place.floorId === 'string' ? undefined : place.floorId
  const building = floor && typeof floor.buildingId !== 'string' ? floor.buildingId : undefined
  const code = 'slotCode' in place ? place.slotCode : place.rowCode

  return `${building?.name ?? 'Building'} / Floor ${(floor as AdminFloorDto | undefined)?.floorNumber ?? '-'} / ${code}`
}

export function AdminBookingsPage() {
  const [sessions, setSessions] = useState<AdminSessionDto[]>([])
  const [vehicleFilter, setVehicleFilter] = useState<AdminSessionDto['vehicleType'] | 'all'>('all')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    let isMounted = true

    async function loadSessions() {
      setIsLoading(true)
      setError(undefined)

      try {
        const data = await adminApi.getSessions({
          limit: 100,
          vehicleType: vehicleFilter === 'all' ? undefined : vehicleFilter,
          licensePlate: search.trim() || undefined,
        })
        if (isMounted) setSessions(data.sessions)
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Khong the tai phien gui xe')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    const timer = window.setTimeout(loadSessions, 250)

    return () => {
      isMounted = false
      window.clearTimeout(timer)
    }
  }, [search, vehicleFilter])

  const stats = useMemo(() => {
    return {
      cars: sessions.filter((session) => session.vehicleType === 'car').length,
      motorcycles: sessions.filter((session) => session.vehicleType === 'motorcycle').length,
      revenue: sessions.reduce((sum, session) => sum + (session.fee ?? 0), 0),
    }
  }, [sessions])

  return (
    <AdminPageShell
      eyebrow="Admin // Bookings"
      title="Booking Overview"
      description="Admin xem tat ca booking cua user, vi tri slot, bien so, thanh toan va trang thai dat cho."
    >
      {error ? (
        <div className="mb-5 rounded-lg border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Active sessions" value={isLoading ? '...' : sessions.length} detail="Loaded from /sessions" />
        <AdminStatCard label="Cars" value={stats.cars} detail={`${stats.motorcycles} motorcycles active`} />
        <AdminStatCard label="Current fees" value={formatAdminCurrency(stats.revenue)} detail="Fee field returned by API" />
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Reservations</p>
            <h2 className="mt-1 text-base font-semibold text-fg">All Bookings</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
              value={vehicleFilter}
              onChange={(event) => setVehicleFilter(event.target.value as AdminSessionDto['vehicleType'] | 'all')}
            >
              <option value="all">All vehicles</option>
              <option value="car">car</option>
              <option value="motorcycle">motorcycle</option>
            </select>
            <input
              className="auth-input h-10 w-full rounded-lg border px-3 text-sm text-fg md:w-56"
              placeholder="Search plate"
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[58rem] text-left text-sm">
            <thead className="border-b border-theme text-xs uppercase tracking-[0.14em] text-subtle">
              <tr>
                <th className="px-3 py-3 font-medium">Session</th>
                <th className="px-3 py-3 font-medium">Resident</th>
                <th className="px-3 py-3 font-medium">Location</th>
                <th className="px-3 py-3 font-medium">Entry</th>
                <th className="px-3 py-3 font-medium">Staff</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {sessions.map((session) => (
                <tr key={session._id} className="align-top">
                  <td className="px-3 py-4">
                    <p className="font-semibold text-fg">{session.licensePlate}</p>
                    <p className="mt-1 text-xs text-subtle">{session.vehicleType}</p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="font-medium text-fg">{session.userId?.fullName ?? 'Visitor'}</p>
                    <p className="mt-1 text-xs text-subtle">{session.userId?.phone ?? session.userId?.email ?? '-'}</p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="font-medium text-fg">{getLocation(session)}</p>
                    <p className="mt-1 text-xs text-subtle">{session.note || '-'}</p>
                  </td>
                  <td className="px-3 py-4 text-muted">{formatTime(session.entryTime)}</td>
                  <td className="px-3 py-4">
                    <p className="font-medium text-fg">{session.staffId?.fullName ?? '-'}</p>
                    <p className="mt-1 text-xs text-subtle">{session.staffId?.email ?? formatAdminCurrency(session.fee ?? 0)}</p>
                  </td>
                  <td className="px-3 py-4">
                    <AdminStatusBadge status={session.status === 'active' ? 'active-session' : session.status} label={session.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!isLoading && sessions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted">Khong co phien gui xe active theo bo loc.</p>
          ) : null}
        </div>
      </section>
    </AdminPageShell>
  )
}
