import { useEffect, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge } from '../components/admin'
import { adminApi, type AdminOccupancyReport } from '../services/adminApi'

export function AdminFloorsPage() {
  const [occupancy, setOccupancy] = useState<AdminOccupancyReport | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadFloors() {
      try {
        setIsLoading(true)
        setError('')
        const response = await adminApi.getOccupancyReport()
        if (!ignore) setOccupancy(response)
      } catch (loadError) {
        if (!ignore) setError(loadError instanceof Error ? loadError.message : 'Cannot load floors')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadFloors()

    return () => {
      ignore = true
    }
  }, [])

  return (
    <AdminPageShell
      eyebrow="Admin // Floors"
      title="Floor Overview"
      description="Admin xem toan bo tang, toa nha, suc chua, trang thai van hanh va manager phu trach."
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Floors" value={isLoading ? '-' : occupancy?.floors.length ?? 0} detail="Active floors from API" />
        <AdminStatCard label="Total capacity" value={isLoading ? '-' : occupancy?.overall.totalCapacity ?? 0} detail="Across all buildings" />
        <AdminStatCard label="Occupied" value={isLoading ? '-' : occupancy?.overall.occupied ?? 0} detail={`${occupancy?.overall.utilizationPercent ?? 0}% utilization`} />
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Buildings</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Floor Directory</h2>
        </div>

        <div className="grid gap-3">
          {isLoading && <p className="text-sm text-muted">Loading floors...</p>}
          {!isLoading && (occupancy?.floors.length ?? 0) === 0 && <p className="text-sm text-muted">No floors found.</p>}
          {!isLoading && occupancy?.floors.map((floor) => {
            const percent = floor.utilizationPercent
            const capacity = floor.totalCapacity ?? floor.totalSlots ?? 0
            const status = floor.maintenance ? 'warning' : 'enabled'

            return (
              <article key={floor.floorId} className="rounded-lg border border-theme bg-badge p-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_7rem_7rem_8rem_9rem] lg:items-center">
                  <div>
                    <p className="text-base font-semibold text-fg">{floor.building?.name ?? 'Building'} / Floor {floor.floorNumber}</p>
                    <p className="mt-1 text-xs text-subtle">{floor.vehicleType} / {floor.floorType}</p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle">Empty</p>
                    <p className="mt-1 font-semibold text-fg">{floor.empty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle">Capacity</p>
                    <p className="mt-1 font-semibold text-fg">{capacity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle">Occupied</p>
                    <p className="mt-1 font-semibold text-fg">{percent}%</p>
                  </div>
                  <AdminStatusBadge status={status} />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-page">
                  <div className="h-full rounded-full bg-btn-primary" style={{ width: `${percent}%` }} />
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </AdminPageShell>
  )
}
