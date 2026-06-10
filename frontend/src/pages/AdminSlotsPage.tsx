import { useEffect, useState } from 'react'
import { AdminPageShell, AdminStatCard } from '../components/admin'
import { useParkingSpaceFilters } from '../hooks/useParkingSpaceFilters'
import { adminApi } from '../services/adminApi'
import type { Building, Floor } from '../services/managerBuildingsApi'
import type { ParkingRow } from '../services/managerParkingRowApi'
import type { ParkingSlot, SlotStatus } from '../services/managerParkingSlotApi'

const slotStatusLabels: Record<SlotStatus, string> = {
  empty: 'Trống',
  occupied: 'Đang dùng',
  reserved: 'Đã đặt',
  maintenance: 'Bảo trì',
}

const slotStatusDetails: Record<SlotStatus, string> = {
  empty: 'Có thể nhận xe',
  occupied: 'Đang có xe',
  reserved: 'Đã giữ chỗ',
  maintenance: 'Tạm ngưng sử dụng',
}

const rowStatusLabels: Record<ParkingRow['status'], string> = {
  available: 'Còn chỗ',
  full: 'Đã đầy',
  maintenance: 'Bảo trì',
}

const statusTone: Record<SlotStatus | ParkingRow['status'], string> = {
  empty: 'border-emerald-400/70 bg-emerald-400/15 text-emerald-100',
  available: 'border-emerald-400/70 bg-emerald-400/15 text-emerald-100',
  occupied: 'border-sky-400/70 bg-sky-400/15 text-sky-100',
  reserved: 'border-amber-400/70 bg-amber-400/15 text-amber-100',
  full: 'border-amber-400/70 bg-amber-400/15 text-amber-100',
  maintenance: 'border-rose-400/70 bg-rose-400/15 text-rose-100',
}

function getFloorBuildingId(floor: Floor) {
  if (typeof floor.buildingId === 'string') return floor.buildingId
  return floor.buildingId?._id
}

function StatusPill({ status, label }: { status: SlotStatus | ParkingRow['status']; label: string }) {
  return (
    <span className={['inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium', statusTone[status]].join(' ')}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  )
}

export function AdminSlotsPage() {
  const [slots, setSlots] = useState<ParkingSlot[]>([])
  const [rows, setRows] = useState<ParkingRow[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function loadParkingSpaces() {
      try {
        setIsLoading(true)
        setError(null)

        const [slotsResponse, rowsResponse, floorsResponse, buildingsResponse] = await Promise.all([
          adminApi.getSlots({ limit: 200, sortBy: 'slotCode', sortOrder: 'asc' }),
          adminApi.getRows({ limit: 200, sortBy: 'rowCode', sortOrder: 'asc' }),
          adminApi.getFloors({ limit: 200, sort: 'floorNumber', order: 'asc' }),
          adminApi.getBuildings({ limit: 200, sort: 'name', order: 'asc' }),
        ])

        if (ignore) return

        setSlots(slotsResponse.slots ?? [])
        setRows(rowsResponse.rows ?? [])
        setFloors(floorsResponse.floors ?? [])
        setBuildings(buildingsResponse.buildings ?? [])
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Không thể tải sơ đồ chỗ đỗ.')
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadParkingSpaces()

    return () => {
      ignore = true
    }
  }, [])

  const {
    buildingFilter,
    floorFilter,
    setBuildingFilter,
    setFloorFilter,
    filteredSlots,
    filteredRows,
    slotsByFloor,
    rowsByFloor,
    visibleSlotFloors,
    visibleRowFloors,
    filteredFloorOptions,
    buildingMap,
    stats,
  } = useParkingSpaceFilters({ slots, rows, floors, buildings })

  const reservedSlots = filteredSlots.filter((slot) => slot.status === 'reserved').length
  const maintenanceRows = filteredRows.filter((row) => row.status === 'maintenance').length

  return (
    <AdminPageShell
      eyebrow="Admin // Chỗ đỗ"
      title="Sơ đồ chỗ đỗ"
      description="Admin xem sơ đồ ô tô và hàng xe máy theo đúng cách manager đang quản lý."
    >
      <section className="mb-5 flex flex-col gap-3 rounded-lg border border-theme bg-badge p-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Bộ lọc</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Chọn tòa nhà và tầng</h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 md:min-w-[28rem]">
          <label className="grid gap-1 text-xs font-medium text-muted">
            Tòa nhà
            <select
              className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
              value={buildingFilter}
              onChange={(event) => setBuildingFilter(event.target.value)}
            >
              <option value="all">Tất cả tòa nhà</option>
              {buildings.map((building) => (
                <option key={building._id} value={building._id}>
                  {building.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-1 text-xs font-medium text-muted">
            Tầng
            <select
              className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
              value={floorFilter}
              onChange={(event) => setFloorFilter(event.target.value)}
            >
              <option value="all">Tất cả tầng</option>
              {filteredFloorOptions.map((floor) => (
                <option key={floor._id} value={floor._id}>
                  Tầng {floor.floorNumber} - {floor.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <AdminStatCard label="Ô đỗ ô tô" value={isLoading ? '-' : stats.totalSlots} detail={`${stats.occupiedSlots} đang dùng`} />
        <AdminStatCard label="Hàng xe máy" value={isLoading ? '-' : stats.totalRows} detail="Tổng số hàng" />
        <AdminStatCard label="Sức chứa xe máy" value={isLoading ? '-' : stats.rowCapacity} detail={`${stats.rowOccupied} đang dùng`} />
        <AdminStatCard label="Bảo trì" value={isLoading ? '-' : stats.maintenanceSlots + maintenanceRows} detail={`${reservedSlots} chỗ đã đặt`} />
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      {!error && isLoading && (
        <div className="liquid-glass-card rounded-lg border border-theme bg-badge p-4 text-sm text-muted">
          Đang tải dữ liệu chỗ đỗ...
        </div>
      )}

      {!error && !isLoading && filteredSlots.length === 0 && filteredRows.length === 0 && (
        <div className="liquid-glass-card rounded-lg border border-theme bg-badge p-4 text-sm text-muted">
          Không có chỗ đỗ nào phù hợp với bộ lọc hiện tại.
        </div>
      )}

      {!error && !isLoading && (
        <section className="grid gap-5">
          {visibleSlotFloors.map((floor) => {
            const buildingId = getFloorBuildingId(floor)
            const building = buildingId ? buildingMap.get(buildingId) : undefined
            const floorSlots = slotsByFloor.get(floor._id) ?? []

            return (
              <div key={floor._id}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-fg">
                      {building?.name ?? 'Tòa nhà'} / Tầng {floor.floorNumber}
                    </h3>
                    <p className="mt-1 text-xs text-muted">{floorSlots.length} ô đỗ ô tô</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                  {floorSlots.map((slot) => (
                    <article key={slot._id} className="min-h-28 rounded-lg border border-theme bg-badge p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-fg">{slot.slotCode}</p>
                          <p className="mt-1 text-xs text-muted">Ô tô</p>
                        </div>
                        <StatusPill status={slot.status} label={slotStatusLabels[slot.status]} />
                      </div>
                      <p className="mt-3 text-[11px] text-muted">{slot.note || slotStatusDetails[slot.status]}</p>
                    </article>
                  ))}
                </div>
              </div>
            )
          })}

          {visibleRowFloors.map((floor) => {
            const buildingId = getFloorBuildingId(floor)
            const building = buildingId ? buildingMap.get(buildingId) : undefined
            const floorRows = rowsByFloor.get(floor._id) ?? []

            return (
              <div key={floor._id}>
                <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-lg font-semibold text-fg">
                      {building?.name ?? 'Tòa nhà'} / Tầng {floor.floorNumber}
                    </h3>
                    <p className="mt-1 text-xs text-muted">{floorRows.length} hàng xe máy</p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
                  {floorRows.map((row) => (
                    <article key={row._id} className="min-h-32 rounded-lg border border-theme bg-badge p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-fg">{row.rowCode}</p>
                          <p className="mt-1 text-xs text-muted">Xe máy</p>
                        </div>
                        <StatusPill status={row.status} label={rowStatusLabels[row.status]} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-muted">
                        <span>Đang dùng</span>
                        <span className="text-right font-semibold text-fg">{row.occupiedCount}</span>
                        <span>Sức chứa</span>
                        <span className="text-right font-semibold text-fg">{row.capacity}</span>
                      </div>
                      {row.note && <p className="mt-3 text-[11px] text-muted">{row.note}</p>}
                    </article>
                  ))}
                </div>
              </div>
            )
          })}
        </section>
      )}
    </AdminPageShell>
  )
}
