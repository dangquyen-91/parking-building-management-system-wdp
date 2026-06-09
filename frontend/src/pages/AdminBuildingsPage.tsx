import { useMemo, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge } from '../components/admin'
import { ManagerBuildingCard } from '../components/manager/ManagerBuildingCard'
import { useManagerBuildings } from '../hooks/useManagerBuildings'

export function AdminBuildingsPage() {
  const { summaries, isLoading, error } = useManagerBuildings()
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const filteredSummaries = useMemo(() => {
    return summaries.filter((building) => {
      if (statusFilter === 'all') return true
      return building.isActive === (statusFilter === 'active')
    })
  }, [statusFilter, summaries])

  const totals = useMemo(() => {
    return filteredSummaries.reduce(
      (acc, building) => {
        acc.floors += building.floorCount
        acc.slots += building.totalSlots
        acc.activeBuildings += building.isActive ? 1 : 0
        return acc
      },
      { floors: 0, slots: 0, activeBuildings: 0 },
    )
  }, [filteredSummaries])

  return (
    <AdminPageShell
      eyebrow="Admin // Buildings"
      title="Building Management View"
      description="Admin xem toan bo toa nha, tang va suc chua ma manager dang quan ly."
      actions={
        <select
          className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
        >
          <option value="all">All buildings</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Buildings" value={isLoading ? '-' : filteredSummaries.length} detail={`${totals.activeBuildings} active`} />
        <AdminStatCard label="Floors" value={isLoading ? '-' : totals.floors} detail="Managed by operations" />
        <AdminStatCard label="Capacity" value={isLoading ? '-' : totals.slots} detail="Configured floor capacity" />
      </div>

      <section className="mt-5 grid gap-4">
        {isLoading && <p className="rounded-lg border border-theme bg-badge p-4 text-sm text-muted">Loading buildings...</p>}
        {!isLoading && filteredSummaries.length === 0 && (
          <p className="rounded-lg border border-theme bg-badge p-4 text-sm text-muted">No buildings found.</p>
        )}
        {!isLoading && filteredSummaries.map((building) => (
          <div key={building.id} className="liquid-glass-card rounded-lg p-1">
            <div className="mb-2 px-3 pt-3">
              <AdminStatusBadge status={building.isActive ? 'active' : 'inactive'} />
            </div>
            <ManagerBuildingCard building={building} />
          </div>
        ))}
      </section>
    </AdminPageShell>
  )
}
