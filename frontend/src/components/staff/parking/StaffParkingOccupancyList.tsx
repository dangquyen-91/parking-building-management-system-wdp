import type { StaffParkingOccupancyItem } from '../../../hooks/useStaffParkingOccupancy'
import { getFloorSection } from '../../../utils/floorLabel'
import { formatVehicleType } from '../data/staffGateUtils'

const FLOOR_TYPE_LABELS: Record<string, string> = {
  resident: 'Cư dân',
  visitor: 'Khách vãng lai',
}

type StaffParkingOccupancyListProps = {
  items: StaffParkingOccupancyItem[]
  isLoading: boolean
  error: string | null
}

export function StaffParkingOccupancyList({
  items,
  isLoading,
  error,
}: StaffParkingOccupancyListProps) {
  if (error) {
    return (
      <p className="rounded-3xl border border-rose-500/40 bg-rose-500/10 p-5 text-sm font-semibold text-rose-700 dark:text-rose-200">
        {error}
      </p>
    )
  }

  if (isLoading) {
    return (
      <p className="rounded-3xl border border-theme bg-badge p-8 text-center text-sm font-semibold text-muted">
        Đang tải sức chứa từng khu...
      </p>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-theme bg-badge p-10 text-center">
        <p className="text-lg font-black text-fg">Chưa có dữ liệu sức chứa</p>
        <p className="mt-2 text-sm text-muted">Khi tòa nhà, tầng và khu đã được tạo, dữ liệu sẽ hiện ở đây.</p>
      </div>
    )
  }

  const buildings = groupByBuilding(items)

  return (
    <section className="grid gap-4">
      {buildings.map((building) => (
        <BuildingOccupancyCard key={building.name} building={building} />
      ))}
    </section>
  )
}

type BuildingGroup = {
  name: string
  total: number
  occupied: number
  available: number
  floors: Array<{
    floorNumber: number
    total: number
    occupied: number
    available: number
    sections: StaffParkingOccupancyItem[]
  }>
}

function groupByBuilding(items: StaffParkingOccupancyItem[]): BuildingGroup[] {
  const buildingMap = new Map<string, BuildingGroup>()

  items.forEach((item) => {
    const building = buildingMap.get(item.buildingName) ?? {
      name: item.buildingName,
      total: 0,
      occupied: 0,
      available: 0,
      floors: [],
    }

    building.total += item.total
    building.occupied += item.occupied
    building.available += item.available

    let floor = building.floors.find((entry) => entry.floorNumber === item.floorNumber)
    if (!floor) {
      floor = {
        floorNumber: item.floorNumber,
        total: 0,
        occupied: 0,
        available: 0,
        sections: [],
      }
      building.floors.push(floor)
    }

    floor.total += item.total
    floor.occupied += item.occupied
    floor.available += item.available
    floor.sections.push(item)
    buildingMap.set(item.buildingName, building)
  })

  return Array.from(buildingMap.values()).map((building) => ({
    ...building,
    floors: building.floors
      .map((floor) => ({
        ...floor,
        sections: floor.sections.sort((a, b) =>
          getFloorSection(a.section).localeCompare(getFloorSection(b.section))
          || a.vehicleType.localeCompare(b.vehicleType),
        ),
      }))
      .sort((a, b) => a.floorNumber - b.floorNumber),
  }))
}

function BuildingOccupancyCard({ building }: { building: BuildingGroup }) {
  const percent = building.total > 0 ? Math.round((building.occupied / building.total) * 100) : 0

  return (
    <article className="liquid-glass-card overflow-hidden rounded-3xl border border-theme">
      <div className="relative border-b border-theme p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-400 via-emerald-400 to-cyan-400" />
        <div className="pointer-events-none absolute right-6 top-6 size-24 rounded-full bg-emerald-400/10 blur-2xl" />

        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-subtle">Tòa nhà</p>
            <h2 className="mt-2 text-2xl font-black text-fg">{building.name}</h2>
            <p className="mt-1 text-sm text-muted">
              {building.floors.length} tầng · {building.total} chỗ · đang dùng {building.occupied}
            </p>
          </div>

          <div className="grid min-w-[18rem] grid-cols-3 gap-2">
            <Summary label="Tổng" value={building.total} />
            <Summary label="Chiếm" value={building.occupied} />
            <Summary label="Trống" value={building.available} />
          </div>
        </div>

        <div className="relative mt-5 h-2 overflow-hidden rounded-full bg-ghost">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500"
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      </div>

      <div className="grid gap-3 bg-page/30 p-4">
        {building.floors.map((floor) => (
          <section key={floor.floorNumber} className="overflow-hidden rounded-2xl border border-theme bg-badge/80">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-theme px-4 py-4">
              <div>
                <p className="text-base font-black text-fg">Tầng {floor.floorNumber}</p>
                <p className="mt-1 text-xs text-muted">
                  {floor.sections.length} khu · {floor.available}/{floor.total} còn trống
                </p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-black text-emerald-700 dark:text-emerald-200">
                Đang chiếm {floor.occupied}
              </span>
            </div>

            <div className="grid gap-2 p-3">
              {floor.sections.map((section) => (
                <SectionRow key={section.key} item={section} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </article>
  )
}

function SectionRow({ item }: { item: StaffParkingOccupancyItem }) {
  return (
    <div className="grid gap-3 rounded-xl border border-theme bg-page/70 p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-full bg-btn-primary/10 px-3 py-1 text-sm font-black text-btn-primary">
          Khu {getFloorSection(item.section)}
        </span>
        <span className="rounded-full border border-theme bg-badge px-3 py-1 text-xs font-bold text-fg">
          {formatVehicleType(item.vehicleType)}
        </span>
        {item.floorType && (
          <span className="rounded-full border border-theme bg-badge px-3 py-1 text-xs font-bold text-fg">
            {FLOOR_TYPE_LABELS[item.floorType] ?? item.floorType}
          </span>
        )}
        <span className="rounded-full border border-theme bg-badge px-3 py-1 text-xs font-bold text-fg">
          {item.utilizationPercent}% sử dụng
        </span>
      </div>

      <dl className="grid grid-cols-3 gap-2 text-center text-xs">
        <MiniMetric label="Tổng" value={item.total} />
        <MiniMetric label="Chiếm" value={item.occupied} />
        <MiniMetric label="Trống" value={item.available} />
      </dl>
    </div>
  )
}

function Summary({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-theme bg-page/60 p-3 text-center">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-subtle">{label}</p>
      <p className="mt-1 text-2xl font-black text-fg">{value}</p>
    </div>
  )
}

function MiniMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-theme bg-badge px-3 py-2">
      <dt className="font-semibold text-subtle">{label}</dt>
      <dd className="mt-0.5 font-black text-fg">{value}</dd>
    </div>
  )
}
