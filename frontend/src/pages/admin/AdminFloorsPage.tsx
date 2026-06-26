import { useEffect, useMemo, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge } from '../../components/admin'
import { adminApi, type AdminOccupancyReport } from '../../services/adminApi'
import { getFloorSection } from '../../utils/floorLabel'

type OccupancyFloor = AdminOccupancyReport['floors'][number]

const vehicleTypeLabels: Record<'car' | 'motorcycle', string> = {
  car: 'Ô tô',
  motorcycle: 'Xe máy',
}

const floorTypeLabels: Record<'resident' | 'visitor', string> = {
  resident: 'Cư dân',
  visitor: 'Khách vãng lai',
}

type FloorGroup = {
  key: string
  buildingName: string
  floorNumber: number
  sections: OccupancyFloor[]
  totalCapacity: number
  occupied: number
  empty: number
  maintenance: number
  utilizationPercent: number
}

function groupOccupancyFloors(floors: OccupancyFloor[]) {
  const map = new Map<string, FloorGroup>()

  floors.forEach((floor) => {
    const buildingId = floor.building?._id ?? 'unknown'
    const key = `${buildingId}:${floor.floorNumber}`
    const capacity = floor.totalCapacity ?? floor.totalSlots ?? 0
    const group = map.get(key) ?? {
      key,
      buildingName: floor.building?.name ?? 'Tòa nhà',
      floorNumber: floor.floorNumber,
      sections: [],
      totalCapacity: 0,
      occupied: 0,
      empty: 0,
      maintenance: 0,
      utilizationPercent: 0,
    }

    group.sections.push(floor)
    group.totalCapacity += capacity
    group.occupied += floor.occupied ?? 0
    group.empty += floor.empty ?? 0
    group.maintenance += floor.maintenance ?? 0
    map.set(key, group)
  })

  return [...map.values()]
    .map((group) => ({
      ...group,
      utilizationPercent: group.totalCapacity > 0 ? Math.round((group.occupied / group.totalCapacity) * 100) : 0,
      sections: group.sections.sort((a, b) => getFloorSection(a.section).localeCompare(getFloorSection(b.section), undefined, { numeric: true, sensitivity: 'base' })),
    }))
    .sort((a, b) => a.buildingName.localeCompare(b.buildingName) || a.floorNumber - b.floorNumber)
}

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
        if (!ignore) setError(loadError instanceof Error ? loadError.message : 'Không thể tải tầng')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadFloors()

    return () => {
      ignore = true
    }
  }, [])

  const floorGroups = useMemo(() => groupOccupancyFloors(occupancy?.floors ?? []), [occupancy])
  const sectionCount = occupancy?.floors?.length ?? 0

  return (
    <AdminPageShell
      eyebrow="Admin // Tầng"
      title="Tổng quan tầng"
      description="Admin xem toàn bộ tầng, khu, tòa nhà, sức chứa và trạng thái vận hành."
    >
      {error && (
        <div className="mb-4 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-4">
        <AdminStatCard label="Tầng" value={isLoading ? '-' : floorGroups.length} detail="Đã gom theo số tầng" tone="violet" />
        <AdminStatCard label="Khu" value={isLoading ? '-' : sectionCount} detail="Khu A/B/C từ API" tone="amber" />
        <AdminStatCard label="Tổng sức chứa" value={isLoading ? '-' : occupancy?.overall.totalCapacity ?? 0} detail="Trên toàn bộ tòa nhà" tone="sky" />
        <AdminStatCard label="Đang dùng" value={isLoading ? '-' : occupancy?.overall.occupied ?? 0} detail={`${occupancy?.overall.utilizationPercent ?? 0}% sử dụng`} tone="emerald" />
      </div>

      <section className="liquid-glass-card mt-5 rounded-2xl border border-sky-500/15 p-4 shadow-sm md:p-5">
        <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500" />
        <div className="mb-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">Tòa nhà</p>
          <h2 className="mt-1 text-lg font-black text-fg">Danh sách tầng và khu</h2>
        </div>

        <div className="grid gap-3">
          {isLoading && <p className="text-sm text-muted">Đang tải tầng...</p>}
          {!isLoading && floorGroups.length === 0 && <p className="text-sm text-muted">Không tìm thấy tầng.</p>}
          {!isLoading && floorGroups.map((group) => {
            const status = group.maintenance ? 'warning' : 'enabled'

            return (
              <details key={group.key} className="rounded-2xl border border-theme bg-badge p-4 transition-all open:border-sky-500/25 open:bg-sky-500/5">
                <summary className="grid cursor-pointer list-none gap-4 lg:grid-cols-[minmax(0,1fr)_7rem_7rem_8rem_9rem] lg:items-center">
                  <div className="min-w-0">
                    <p className="truncate text-base font-black text-fg">{group.buildingName} / Tầng {group.floorNumber}</p>
                    <p className="mt-1 text-xs text-subtle">{group.sections.length} khu · Khu {group.sections.map((floor) => getFloorSection(floor.section)).join(', ')}</p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle">Trống</p>
                    <p className="mt-1 font-semibold text-fg">{group.empty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle">Sức chứa</p>
                    <p className="mt-1 font-semibold text-fg">{group.totalCapacity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle">Đang dùng</p>
                    <p className="mt-1 font-semibold text-fg">{group.utilizationPercent}%</p>
                  </div>
                  <AdminStatusBadge status={status} />
                </summary>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-page">
                  <div className={`h-full rounded-full ${group.utilizationPercent >= 90 ? 'bg-gradient-to-r from-amber-500 to-rose-500' : group.utilizationPercent >= 60 ? 'bg-gradient-to-r from-sky-500 to-violet-500' : 'bg-gradient-to-r from-emerald-500 to-cyan-400'}`} style={{ width: `${group.utilizationPercent}%` }} />
                </div>

                <div className="mt-4 grid gap-2 md:grid-cols-2">
                  {group.sections.map((floor) => {
                    const capacity = floor.totalCapacity ?? floor.totalSlots ?? 0
                    const percent = floor.utilizationPercent
                    return (
                      <article key={floor.floorId} className="rounded-xl border border-theme bg-page/60 p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-bold text-fg">Khu {getFloorSection(floor.section)}</p>
                            <p className="mt-1 text-xs text-subtle">{vehicleTypeLabels[floor.vehicleType]} / {floorTypeLabels[floor.floorType]}</p>
                          </div>
                          <span className="rounded-full border border-theme bg-badge px-2.5 py-1 text-xs font-bold text-subtle">{percent}%</span>
                        </div>
                        <p className="mt-3 text-xs text-muted">Trống {floor.empty} · Đang dùng {floor.occupied} · Sức chứa {capacity}</p>
                      </article>
                    )
                  })}
                </div>
              </details>
            )
          })}
        </div>
      </section>
    </AdminPageShell>
  )
}
