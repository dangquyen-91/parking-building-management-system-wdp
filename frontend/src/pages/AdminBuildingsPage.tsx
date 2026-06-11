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
      eyebrow="Admin // Tòa nhà"
      title="Quản lý tòa nhà"
      description="Admin xem toàn bộ tòa nhà, tầng và sức chứa mà manager đang quản lý."
      actions={
        <select
          className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
        >
          <option value="all">Tất cả tòa nhà</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Ngưng hoạt động</option>
        </select>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Tòa nhà" value={isLoading ? '-' : filteredSummaries.length} detail={`${totals.activeBuildings} đang hoạt động`} />
        <AdminStatCard label="Tầng" value={isLoading ? '-' : totals.floors} detail="Được vận hành bởi manager" />
        <AdminStatCard label="Sức chứa" value={isLoading ? '-' : totals.slots} detail="Tổng sức chứa đã cấu hình" />
      </div>

      <section className="mt-5 grid gap-4">
        {isLoading && <p className="rounded-lg border border-theme bg-badge p-4 text-sm text-muted">Đang tải tòa nhà...</p>}
        {!isLoading && filteredSummaries.length === 0 && (
          <p className="rounded-lg border border-theme bg-badge p-4 text-sm text-muted">Không tìm thấy tòa nhà.</p>
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
