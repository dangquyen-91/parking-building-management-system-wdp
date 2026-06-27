import { useId, useMemo, useState } from 'react'
import type { ManagerBuildingSummary } from '../../../hooks/useManagerBuildings'
import { getFloorSection } from '../../../utils/floorLabel'

type ManagerBuildingCardProps = {
  building: ManagerBuildingSummary
  onEdit?: (building: ManagerBuildingSummary) => void
  onEditFloor?: (floor: ManagerBuildingSummary['floors'][number]) => void
}

type FloorGroup = {
  floorNumber: number | string
  floors: ManagerBuildingSummary['floors']
  totalSlots: number
  activeFloors: number
}

function formatVehicleType(value: ManagerBuildingSummary['floors'][number]['vehicleType']) {
  return value === 'motorcycle' ? 'Xe máy' : 'Ô tô'
}

function formatFloorType(value: ManagerBuildingSummary['floors'][number]['floorType']) {
  return value === 'resident' ? 'Cư dân' : 'Khách vãng lai'
}

function groupFloorsByNumber(floors: ManagerBuildingSummary['floors']) {
  const groups = new Map<number | string, FloorGroup>()

  floors.forEach((floor) => {
    const floorNumber = floor.floorNumber ?? '-'
    const current = groups.get(floorNumber) ?? {
      floorNumber,
      floors: [],
      totalSlots: 0,
      activeFloors: 0,
    }

    current.floors.push(floor)
    current.totalSlots += floor.totalSlots
    if (floor.isActive) current.activeFloors += 1
    groups.set(floorNumber, current)
  })

  return Array.from(groups.values()).sort((a, b) => Number(a.floorNumber) - Number(b.floorNumber))
}

export function ManagerBuildingCard({ building, onEdit, onEditFloor }: ManagerBuildingCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [openFloors, setOpenFloors] = useState<Set<number | string>>(new Set())
  const contentId = useId()
  const floorGroups = useMemo(() => groupFloorsByNumber(building.floors), [building.floors])

  function toggleFloor(floorNumber: number | string) {
    setOpenFloors((prev) => {
      const next = new Set(prev)
      if (next.has(floorNumber)) next.delete(floorNumber)
      else next.add(floorNumber)
      return next
    })
  }

  return (
    <article className="group overflow-hidden rounded-2xl border border-theme bg-badge shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-400 via-btn-primary to-emerald-400" />
        <div className="absolute right-4 top-4 size-20 rounded-full bg-cyan-400/10 blur-2xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex size-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/15 text-sm font-black text-cyan-700 shadow-sm dark:text-cyan-100">
                P
              </span>
              <div className="min-w-0">
                <p className="truncate text-xl font-black text-fg">{building.name}</p>
                <p className="mt-1 truncate text-xs text-subtle">{building.address}</p>
              </div>
            </div>

            {building.description && <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted">{building.description}</p>}

            <span
              className={`mt-4 inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                building.isActive
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-200'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-200'
              }`}
            >
              {building.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
            </span>
          </div>

          <div className="grid min-w-[16rem] grid-cols-2 gap-3">
            <div className="rounded-2xl border border-theme bg-page/50 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.16em] text-subtle">Tầng</p>
              <p className="mt-2 text-2xl font-black text-fg">{building.floorCount}</p>
              <p className="mt-1 text-[11px] text-muted">{building.activeFloors} khu hoạt động</p>
            </div>
            <div className="rounded-2xl border border-theme bg-page/50 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.16em] text-subtle">Chỗ đỗ</p>
              <p className="mt-2 text-2xl font-black text-fg">{building.totalSlots}</p>
              <p className="mt-1 text-[11px] text-muted">Tổng sức chứa</p>
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-theme bg-page/60 px-4 text-sm font-bold text-fg transition hover:bg-page"
            aria-expanded={isOpen}
            aria-controls={contentId}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? 'Ẩn danh sách tầng' : 'Xem danh sách tầng'}
            <span className="ml-2 rounded-full bg-btn-primary/10 px-2 py-0.5 text-xs text-btn-primary">
              {floorGroups.length}
            </span>
          </button>

          {onEdit && (
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-btn-primary px-4 text-sm font-bold text-btn-primary-fg transition hover:opacity-90"
              onClick={() => onEdit(building)}
            >
              Sửa tòa nhà
            </button>
          )}
        </div>
      </div>

      {isOpen && (
        <div id={contentId} className="border-t border-theme bg-page/30 p-4">
          {floorGroups.length === 0 ? (
            <div className="rounded-xl border border-theme bg-badge/70 px-4 py-3 text-sm text-muted">
              Chưa có tầng/khu nào được tạo.
            </div>
          ) : (
            <div className="grid gap-3">
              {floorGroups.map((group) => {
                const isFloorOpen = openFloors.has(group.floorNumber)

                return (
                  <section key={group.floorNumber} className="overflow-hidden rounded-2xl border border-theme bg-badge/80">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition hover:bg-page/50"
                      aria-expanded={isFloorOpen}
                      onClick={() => toggleFloor(group.floorNumber)}
                    >
                      <div>
                        <p className="text-base font-black text-fg">Tầng {group.floorNumber}</p>
                        <p className="mt-1 text-xs text-muted">
                          {group.floors.length} khu · {group.totalSlots} chỗ đỗ
                        </p>
                      </div>
                      <span className="rounded-full bg-btn-primary/10 px-3 py-1 text-xs font-bold text-btn-primary">
                        {isFloorOpen ? 'Thu gọn' : 'Xem khu'}
                      </span>
                    </button>

                    {isFloorOpen && (
                      <div className="grid gap-2 border-t border-theme p-3">
                        {group.floors.map((floor) => (
                          <div
                            key={floor.id}
                            className="grid gap-3 rounded-xl border border-theme bg-page/60 p-3 sm:grid-cols-[1fr_auto] sm:items-center"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-btn-primary/10 px-3 py-1 text-sm font-black text-btn-primary">
                                Khu {getFloorSection(floor.section)}
                              </span>
                              <span className="rounded-full border border-theme bg-badge px-3 py-1 text-xs font-bold text-fg">
                                {formatVehicleType(floor.vehicleType)}
                              </span>
                              <span className="rounded-full border border-theme bg-badge px-3 py-1 text-xs font-bold text-fg">
                                {formatFloorType(floor.floorType)}
                              </span>
                              <span className="rounded-full border border-theme bg-badge px-3 py-1 text-xs font-bold text-fg">
                                {floor.totalSlots} chỗ
                              </span>
                              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-200">
                                {floor.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                              </span>
                            </div>

                            {onEditFloor && (
                              <button
                                type="button"
                                className="h-9 rounded-xl border border-btn-primary/40 bg-btn-primary/10 px-4 text-xs font-bold text-btn-primary transition hover:border-btn-primary hover:bg-btn-primary hover:text-btn-primary-fg"
                                onClick={() => onEditFloor(floor)}
                              >
                                Sửa khu
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </section>
                )
              })}
            </div>
          )}
        </div>
      )}
    </article>
  )
}
