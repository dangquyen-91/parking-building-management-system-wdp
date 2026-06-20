import { useEffect, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge } from '../../components/admin'
import { adminApi, type AdminOccupancyReport } from '../../services/adminApi'

const vehicleTypeLabels: Record<'car' | 'motorcycle', string> = {
  car: 'Ô tô',
  motorcycle: 'Xe máy',
}

const floorTypeLabels: Record<'resident' | 'visitor', string> = {
  resident: 'Cư dân',
  visitor: 'Khách vãng lai',
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

  return (
    <AdminPageShell
      eyebrow="Admin // Tầng"
      title="Tổng quan tầng"
      description="Admin xem toàn bộ tầng, tòa nhà, sức chứa, trạng thái vận hành và quản lý phụ trách."
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Tầng" value={isLoading ? '-' : occupancy?.floors.length ?? 0} detail="Tầng đang hoạt động từ API" />
        <AdminStatCard label="Tổng sức chứa" value={isLoading ? '-' : occupancy?.overall.totalCapacity ?? 0} detail="Trên toàn bộ tòa nhà" />
        <AdminStatCard label="Đang dùng" value={isLoading ? '-' : occupancy?.overall.occupied ?? 0} detail={`${occupancy?.overall.utilizationPercent ?? 0}% sử dụng`} />
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Tòa nhà</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Danh sách tầng</h2>
        </div>

        <div className="grid gap-3">
          {isLoading && <p className="text-sm text-muted">Đang tải tầng...</p>}
          {!isLoading && (occupancy?.floors.length ?? 0) === 0 && <p className="text-sm text-muted">Không tìm thấy tầng.</p>}
          {!isLoading && occupancy?.floors.map((floor) => {
            const percent = floor.utilizationPercent
            const capacity = floor.totalCapacity ?? floor.totalSlots ?? 0
            const status = floor.maintenance ? 'warning' : 'enabled'

            return (
              <article key={floor.floorId} className="rounded-lg border border-theme bg-badge p-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_7rem_7rem_8rem_9rem] lg:items-center">
                  <div>
                    <p className="text-base font-semibold text-fg">{floor.building?.name ?? 'Tòa nhà'} / Tầng {floor.floorNumber}</p>
                    <p className="mt-1 text-xs text-subtle">{vehicleTypeLabels[floor.vehicleType]} / {floorTypeLabels[floor.floorType]}</p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle">Trống</p>
                    <p className="mt-1 font-semibold text-fg">{floor.empty}</p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle">Sức chứa</p>
                    <p className="mt-1 font-semibold text-fg">{capacity}</p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle">Đang dùng</p>
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
