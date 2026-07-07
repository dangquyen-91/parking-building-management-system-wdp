import type { StaffParkingOccupancyItem } from '../../../hooks/useStaffParkingOccupancy'
import { getFloorSection } from '../../../utils/floorLabel'
import { formatVehicleType } from '../data/staffGateUtils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

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

            <Table className="min-w-[680px]">
              <TableHeader className="bg-page/35 text-xs text-subtle">
                <TableRow className="border-theme hover:bg-transparent">
                  <TableHead className="h-auto px-4 py-3 text-subtle">Khu / Phân loại</TableHead>
                  <TableHead className="h-auto px-3 py-3 text-subtle">Tổng</TableHead>
                  <TableHead className="h-auto px-3 py-3 text-subtle">Đang chiếm</TableHead>
                  <TableHead className="h-auto px-3 py-3 text-subtle">Còn trống</TableHead>
                  <TableHead className="h-auto px-3 py-3 text-subtle">Sử dụng</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
              {floor.sections.map((section) => (
                <SectionRow key={section.key} item={section} />
              ))}
              </TableBody>
            </Table>
          </section>
        ))}
      </div>
    </article>
  )
}

function SectionRow({ item }: { item: StaffParkingOccupancyItem }) {
  return (
    <TableRow className="border-theme bg-page/60 hover:bg-sky-500/5">
      <TableCell className="px-4 py-3 whitespace-normal">
        <div className="flex min-w-[17rem] flex-wrap items-center gap-2">
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
        </div>
      </TableCell>
      <TableCell className="px-3 py-3 font-black text-fg">{item.total}</TableCell>
      <TableCell className="px-3 py-3 font-black text-fg">{item.occupied}</TableCell>
      <TableCell className="px-3 py-3 font-black text-emerald-700 dark:text-emerald-200">{item.available}</TableCell>
      <TableCell className="px-3 py-3">
        <div className="min-w-[9rem]">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-fg">
            <span>{item.occupied}/{item.total}</span>
            <span>{item.utilizationPercent}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-badge">
            <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-sky-500" style={{ width: `${Math.min(100, item.utilizationPercent)}%` }} />
          </div>
        </div>
      </TableCell>
    </TableRow>
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

