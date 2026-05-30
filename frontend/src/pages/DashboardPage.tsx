import { useEffect, useMemo, useState } from 'react'
import {
  ADMIN_CONTROLS,
  ADMIN_ROLES,
  AdminPageShell,
  AdminStatCard,
  AdminStatusBadge,
} from '../components/admin'
import { adminApi, type AdminBuildingDto, type AdminFloorDto, type AdminSessionDto, type AdminSlotDto, type AdminUserDto } from '../services/adminApi'

export function DashboardPage() {
  const [users, setUsers] = useState<AdminUserDto[]>([])
  const [buildings, setBuildings] = useState<AdminBuildingDto[]>([])
  const [floors, setFloors] = useState<AdminFloorDto[]>([])
  const [slots, setSlots] = useState<AdminSlotDto[]>([])
  const [sessions, setSessions] = useState<AdminSessionDto[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>()

  useEffect(() => {
    let isMounted = true

    async function loadDashboard() {
      setIsLoading(true)
      setError(undefined)

      try {
        const [userData, buildingData, floorData, slotData, sessionData] = await Promise.all([
          adminApi.getUsers({ limit: 100 }),
          adminApi.getBuildings({ limit: 100 }),
          adminApi.getFloors({ limit: 100 }),
          adminApi.getSlots({ limit: 200 }),
          adminApi.getSessions({ limit: 100 }),
        ])

        if (!isMounted) return
        setUsers(userData.users)
        setBuildings(buildingData.buildings)
        setFloors(floorData.floors)
        setSlots(slotData.slots)
        setSessions(sessionData.sessions)
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Khong the tai dashboard admin')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadDashboard()

    return () => {
      isMounted = false
    }
  }, [])

  const roleCounts = useMemo(() => {
    return users.reduce<Record<string, number>>((acc, user) => {
      acc[user.role] = (acc[user.role] ?? 0) + 1
      return acc
    }, {})
  }, [users])

  const activeUsers = users.filter((user) => user.isActive).length
  const inactiveUsers = users.length - activeUsers
  const occupiedSlots = slots.filter((slot) => slot.status === 'occupied').length
  const activeSessions = sessions.filter((session) => session.status === 'active').length

  return (
    <AdminPageShell
      eyebrow="Admin // Dashboard"
      title="System Administration"
      description="Quan ly tai khoan, phan quyen, cau hinh he thong va nhat ky bao mat cho toan bo parking platform."
    >
      {error ? (
        <div className="mb-5 rounded-lg border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Active users" value={isLoading ? '...' : activeUsers} detail={`${users.length} accounts from API`} />
        <AdminStatCard label="Buildings" value={isLoading ? '...' : buildings.length} detail={`${floors.length} floors configured`} />
        <AdminStatCard label="Occupied slots" value={isLoading ? '...' : occupiedSlots} detail={`${slots.length} car slots tracked`} />
        <AdminStatCard label="Active sessions" value={isLoading ? '...' : activeSessions} detail="Vehicles currently parked" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Admin Scope</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Nen quan ly nhung gi?</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {ADMIN_CONTROLS.map((control) => (
              <article key={control.title} className="rounded-lg border border-theme bg-badge p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fg">{control.title}</p>
                    <p className="mt-2 text-sm text-muted">{control.detail}</p>
                  </div>
                  <AdminStatusBadge status={control.status} label={control.status} />
                </div>
                <p className="mt-4 text-xs text-subtle">Owner: {control.owner}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Security</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Live Health</h2>
          </div>

          <div className="grid gap-2">
            {[
              { id: 'users', action: 'Tai khoan dang hoat dong', target: `${activeUsers}/${users.length} users active`, status: inactiveUsers > 0 ? 'warning' : 'enabled' },
              { id: 'slots', action: 'O do xe san sang', target: `${slots.filter((slot) => slot.status === 'empty').length} empty / ${slots.length} total`, status: 'enabled' },
              { id: 'sessions', action: 'Phien gui xe active', target: `${activeSessions} sessions from /sessions`, status: activeSessions > 0 ? 'enabled' : 'warning' },
            ].map((log) => (
              <div key={log.id} className="rounded-lg border border-theme bg-badge p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fg">{log.action}</p>
                    <p className="mt-1 text-xs text-subtle">Realtime API</p>
                  </div>
                  <AdminStatusBadge status={log.status as 'enabled' | 'warning'} />
                </div>
                <p className="mt-3 text-xs text-muted">{log.target}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Roles</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Permission Ownership</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {ADMIN_ROLES.map((role) => (
            <article key={role.name} className="rounded-lg border border-theme bg-badge p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-fg">{role.name}</p>
                  <p className="mt-1 text-xs text-subtle">{role.scope}</p>
                </div>
                <span className="rounded-full border border-theme px-2 py-1 text-[10px] text-subtle">
                  {roleCounts[role.name.toLowerCase()] ?? 0} users
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <span key={permission} className="rounded-full border border-theme bg-page px-2 py-1 text-[11px] text-muted">
                    {permission}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AdminPageShell>
  )
}
