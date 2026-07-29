import { Button } from '@/components/ui/button'
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
    <article className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-cyan-400 via-primary to-emerald-400" />
        <div className="absolute right-4 top-4 size-20 rounded-full bg-cyan-400/10 blur-2xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex size-11 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/15 text-sm font-black text-cyan-700 shadow-sm dark:text-cyan-100">
                P
              </span>
              <div className="min-w-0">
                <p className="truncate text-xl font-black text-foreground">{building.name}</p>
                <p className="mt-1 truncate text-xs text-muted-foreground">{building.address}</p>
              </div>
            </div>

            {building.description && <p className="mt-4 max-w-3xl text-sm leading-relaxed text-muted-foreground">{building.description}</p>}

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
            <div className="rounded-2xl border border-border bg-background/50 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Tầng</p>
              <p className="mt-2 text-2xl font-black text-foreground">{building.floorCount}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{building.activeFloors} khu hoạt động</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/50 p-4 text-center">
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Chỗ đỗ</p>
              <p className="mt-2 text-2xl font-black text-foreground">{building.totalSlots}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Tổng sức chứa</p>
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-xl border border-border bg-background/60 px-4 text-sm font-bold text-foreground transition hover:bg-background"
            aria-expanded={isOpen}
            aria-controls={contentId}
            onClick={() => setIsOpen((prev) => !prev)}
          >
            {isOpen ? 'Ẩn danh sách tầng' : 'Xem danh sách tầng'}
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
              {floorGroups.length}
            </span>
          </Button>

          {onEdit && (
            <Button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-xl bg-primary px-4 text-sm font-bold text-primary-foreground transition hover:opacity-90"
              onClick={() => onEdit(building)}
            >
              Sửa tòa nhà
            </Button>
          )}
        </div>
      </div>

      {isOpen && (
        <div id={contentId} className="border-t border-border bg-background/30 p-4">
          {floorGroups.length === 0 ? (
            <div className="rounded-xl border border-border bg-card/70 px-4 py-3 text-sm text-muted-foreground">
              Chưa có tầng/khu nào được tạo.
            </div>
          ) : (
            <div className="grid gap-3">
              {floorGroups.map((group) => {
                const isFloorOpen = openFloors.has(group.floorNumber)

                return (
                  <section key={group.floorNumber} className="overflow-hidden rounded-2xl border border-border bg-card/80">
                    <Button
                      type="button"
                      variant="ghost"
                      className="flex h-auto w-full items-center justify-between gap-4 rounded-none bg-transparent px-4 py-4 text-left text-foreground hover:bg-background/50 hover:text-foreground"
                      aria-expanded={isFloorOpen}
                      onClick={() => toggleFloor(group.floorNumber)}
                    >
                      <div>
                        <p className="text-base font-black text-foreground">Tầng {group.floorNumber}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {group.floors.length} khu · {group.totalSlots} chỗ đỗ
                        </p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
                        {isFloorOpen ? 'Thu gọn' : 'Xem khu'}
                      </span>
                    </Button>

                    {isFloorOpen && (
                      <div className="grid gap-2 border-t border-border p-3">
                        {group.floors.map((floor) => (
                          <div
                            key={floor.id}
                            className="grid gap-3 rounded-xl border border-border bg-background/60 p-3 sm:grid-cols-[1fr_auto] sm:items-center"
                          >
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-black text-primary">
                                Khu {getFloorSection(floor.section)}
                              </span>
                              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-foreground">
                                {formatVehicleType(floor.vehicleType)}
                              </span>
                              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-foreground">
                                {formatFloorType(floor.floorType)}
                              </span>
                              <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-foreground">
                                {floor.totalSlots} chỗ
                              </span>
                              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-700 dark:text-emerald-200">
                                {floor.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
                              </span>
                            </div>

                            {onEditFloor && (
                              <Button
                                type="button"
                                className="h-9 rounded-xl border border-ring/40 bg-primary/10 px-4 text-xs font-bold text-primary transition hover:border-ring hover:bg-primary hover:text-primary-foreground"
                                onClick={() => onEditFloor(floor)}
                              >
                                Sửa khu
                              </Button>
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



