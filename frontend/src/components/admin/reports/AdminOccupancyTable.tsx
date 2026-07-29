import type { AdminOccupancyReport } from '../../../services/adminApi'
import { getFloorSection } from '../../../utils/floorLabel'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table'

type AdminOccupancyFloor = AdminOccupancyReport['floors'][number]

const vehicleLabels: Record<AdminOccupancyFloor['vehicleType'], string> = {
  car: 'Ô tô',
  motorcycle: 'Xe máy',
}

const floorTypeLabels: Record<string, string> = {
  resident: 'Cư dân',
  visitor: 'Khách vãng lai',
}

const vehicleTones: Record<AdminOccupancyFloor['vehicleType'], string> = {
  car: 'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-200',
  motorcycle:
    'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-200',
}

type AdminFloorGroup = {
  floorNumber: string | number
  floors: AdminOccupancyFloor[]
}

type AdminBuildingGroup = {
  buildingId: string
  buildingName: string
  totalCapacity: number
  occupied: number
  floors: AdminFloorGroup[]
}

export function AdminOccupancyTable({
  report,
}: {
  report: AdminOccupancyReport
}) {
  const groups = buildAdminOccupancyGroups(report.floors)
  const overallUsage = clampUsage(report.overall.utilizationPercent)

  return (
    <section className="overflow-hidden rounded-3xl bg-card text-card-foreground ring-1 ring-border">
      <div className="border-b border-border bg-linear-to-r from-sky-500/15 via-emerald-500/10 to-transparent p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">
              <span className="size-2 rounded-full bg-emerald-500" />
              Công suất hiện tại
            </p>
            <h2 className="mt-2 text-xl font-black text-foreground">
              Bản đồ tải theo tòa nhà
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Gom theo tòa nhà, tầng và khu để dễ nhìn khu nào đang còn chỗ.
            </p>
          </div>

          <div className="min-w-[14rem] rounded-2xl border border-border bg-background/60 p-3">
            <div className="flex items-center justify-between gap-4 text-xs font-bold text-muted-foreground">
              <span>Tổng sử dụng</span>
              <span className="text-foreground">{overallUsage}%</span>
            </div>
            <UsageBar value={overallUsage} className="mt-2" />
            <p className="mt-2 text-xs text-muted-foreground">
              <span className="font-black text-foreground">
                {report.overall.occupied}
              </span>
              /{report.overall.totalCapacity} vị trí đang dùng
            </p>
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          Chưa có dữ liệu tầng đỗ xe.
        </p>
      ) : (
        <div className="grid max-h-[38rem] gap-4 overflow-y-auto p-4 sidebar-scrollbar">
          {groups.map((group) => (
            <AdminBuildingOccupancy key={group.buildingId} group={group} />
          ))}
        </div>
      )}
    </section>
  )
}

function AdminBuildingOccupancy({
  group,
}: {
  group: AdminBuildingGroup
}) {
  const usage =
    group.totalCapacity > 0
      ? Math.round((group.occupied / group.totalCapacity) * 100)
      : 0

  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-background/65 shadow-sm">
      <div className="border-b border-border p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-black text-foreground">
              {group.buildingName}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {group.floors.length} tầng · {group.occupied}/
              {group.totalCapacity} vị trí đang dùng
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card px-4 py-2 text-right">
            <p className="text-xl font-black text-foreground">{usage}%</p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-muted-foreground">
              Sử dụng
            </p>
          </div>
        </div>
        <UsageBar value={usage} className="mt-4" />
      </div>

      <div className="grid gap-3 p-3">
        {group.floors.map((floorGroup) => (
          <AdminFloorOccupancy
            key={`${group.buildingId}-${floorGroup.floorNumber}`}
            floorNumber={floorGroup.floorNumber}
            floors={floorGroup.floors}
          />
        ))}
      </div>
    </article>
  )
}

function AdminFloorOccupancy({
  floorNumber,
  floors,
}: {
  floorNumber: string | number
  floors: AdminOccupancyFloor[]
}) {
  const totalCapacity = floors.reduce(
    (sum, floor) => sum + getCapacity(floor),
    0,
  )
  const occupied = floors.reduce((sum, floor) => sum + floor.occupied, 0)
  const usage =
    totalCapacity > 0 ? Math.round((occupied / totalCapacity) * 100) : 0

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <div className="flex flex-col gap-3 border-b border-border bg-background/45 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-foreground">
            Tầng {floorNumber}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {floors.length} khu · {occupied}/{totalCapacity} vị trí
          </p>
        </div>
        <span className="w-fit rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black text-emerald-700 dark:text-emerald-200">
          {usage}% tải
        </span>
      </div>

      <Table className="min-w-[720px]">
        <TableHeader className="bg-background/35 text-xs text-muted-foreground">
          <TableRow className="border-border hover:bg-transparent">
            <TableHead className="h-auto px-3 py-3 text-muted-foreground">
              Khu / Loại xe
            </TableHead>
            <TableHead className="h-auto px-3 py-3 text-muted-foreground">
              Đang đỗ
            </TableHead>
            <TableHead className="h-auto px-3 py-3 text-muted-foreground">
              Còn trống
            </TableHead>
            <TableHead className="h-auto px-3 py-3 text-muted-foreground">
              Khác
            </TableHead>
            <TableHead className="h-auto px-3 py-3 text-muted-foreground">
              Sử dụng
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {floors.map((floor) => (
            <AdminOccupancyRow key={floor.floorId} floor={floor} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function AdminOccupancyRow({ floor }: { floor: AdminOccupancyFloor }) {
  const usage = clampUsage(floor.utilizationPercent)
  const capacity = getCapacity(floor)
  const floorType =
    floorTypeLabels[floor.floorType] ?? floor.floorType ?? 'Chưa phân loại'

  return (
    <TableRow className="border-border bg-background/60 hover:bg-sky-500/5">
      <TableCell className="px-3 py-3 whitespace-normal">
        <div className="min-w-[15rem]">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl bg-primary px-3 py-1 text-xs font-black text-primary-foreground">
              Khu {getFloorSection(floor.section)}
            </span>
            <span
              className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${vehicleTones[floor.vehicleType]}`}
            >
              {vehicleLabels[floor.vehicleType]}
            </span>
            <span className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-bold text-muted-foreground">
              {floorType}
            </span>
          </div>
          {floor.description && (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {floor.description}
            </p>
          )}
        </div>
      </TableCell>
      <TableCell className="px-3 py-3 font-black text-foreground">
        {floor.occupied}
      </TableCell>
      <TableCell className="px-3 py-3 font-black text-foreground">
        {floor.empty}
      </TableCell>
      <TableCell className="px-3 py-3 text-muted-foreground">
        <div className="flex min-w-[8rem] flex-col gap-1 text-xs">
          <span>Đặt trước {floor.reserved ?? 0}</span>
          <span>Bảo trì {floor.maintenance ?? 0}</span>
        </div>
      </TableCell>
      <TableCell className="px-3 py-3">
        <div className="min-w-[9rem]">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-foreground">
            <span>
              {floor.occupied}/{capacity}
            </span>
            <span>{usage}%</span>
          </div>
          <UsageBar value={usage} className="mt-2" />
        </div>
      </TableCell>
    </TableRow>
  )
}

function UsageBar({ value, className = '' }: { value: number; className?: string }) {
  return (
    <div className={`${className} h-2 overflow-hidden rounded-full bg-card`}>
      <div
        className="h-full rounded-full bg-linear-to-r from-sky-500 to-emerald-400"
        style={{ width: `${clampUsage(value)}%` }}
      />
    </div>
  )
}

function clampUsage(value: number) {
  return Math.min(100, Math.max(0, value))
}

function getCapacity(floor: AdminOccupancyFloor) {
  return floor.totalCapacity ?? floor.totalSlots ?? floor.occupied + floor.empty
}

function buildAdminOccupancyGroups(floors: AdminOccupancyFloor[]) {
  const buildings = new Map<string, AdminBuildingGroup>()

  floors.forEach((floor) => {
    const buildingId = floor.building?._id ?? 'unknown'
    const capacity = getCapacity(floor)
    const building = buildings.get(buildingId) ?? {
      buildingId,
      buildingName: floor.building?.name ?? 'Chưa xác định',
      totalCapacity: 0,
      occupied: 0,
      floors: [],
    }

    building.totalCapacity += capacity
    building.occupied += floor.occupied

    let floorGroup = building.floors.find(
      (item) => String(item.floorNumber) === String(floor.floorNumber),
    )
    if (!floorGroup) {
      floorGroup = { floorNumber: floor.floorNumber, floors: [] }
      building.floors.push(floorGroup)
    }
    floorGroup.floors.push(floor)
    buildings.set(buildingId, building)
  })

  return Array.from(buildings.values())
    .map((building) => ({
      ...building,
      floors: building.floors
        .map((floorGroup) => ({
          ...floorGroup,
          floors: floorGroup.floors.sort(compareAdminSections),
        }))
        .sort((a, b) => Number(a.floorNumber) - Number(b.floorNumber)),
    }))
    .sort((a, b) => a.buildingName.localeCompare(b.buildingName, 'vi'))
}

function compareAdminSections(
  first: AdminOccupancyFloor,
  second: AdminOccupancyFloor,
) {
  const sectionComparison = getFloorSection(first.section).localeCompare(
    getFloorSection(second.section),
    'vi',
  )
  if (sectionComparison !== 0) return sectionComparison
  return vehicleLabels[first.vehicleType].localeCompare(
    vehicleLabels[second.vehicleType],
    'vi',
  )
}
