import type { ManagerOccupancyFloor, ManagerOccupancyReport } from '../../../services/managerReportsApi'
import { getFloorSection } from '../../../utils/floorLabel'

const VEHICLE_LABELS: Record<ManagerOccupancyFloor['vehicleType'], string> = {
  car: 'Ô tô',
  motorcycle: 'Xe máy',
}

const FLOOR_TYPE_LABELS: Record<string, string> = {
  resident: 'Cư dân',
  visitor: 'Khách vãng lai',
}

const VEHICLE_TONES: Record<ManagerOccupancyFloor['vehicleType'], string> = {
  car: 'border-violet-500/25 bg-violet-500/10 text-violet-700 dark:text-violet-200',
  motorcycle: 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-200',
}

type FloorGroup = {
  floorNumber: string | number
  floors: ManagerOccupancyFloor[]
}

type BuildingGroup = {
  buildingId: string
  buildingName: string
  totalCapacity: number
  occupied: number
  floors: FloorGroup[]
}

export function ManagerOccupancyTable({ report }: { report: ManagerOccupancyReport }) {
  const groups = buildOccupancyGroups(report.floors)
  const overallUsage = Math.min(100, Math.max(0, report.overall.utilizationPercent))

  return (
    <section className="liquid-glass-card overflow-hidden rounded-3xl">
      <div className="border-b border-theme bg-gradient-to-r from-sky-500/15 via-emerald-500/10 to-transparent p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-subtle">
              <span className="size-2 rounded-full bg-emerald-500" />
              Công suất hiện tại
            </p>
            <h2 className="mt-2 text-xl font-black text-fg">Bản đồ tải theo tòa nhà</h2>
            <p className="mt-1 text-sm text-muted">Gom theo tòa nhà, tầng và khu để dễ nhìn khu nào đang còn chỗ.</p>
          </div>

          <div className="min-w-[14rem] rounded-2xl border border-theme bg-page/60 p-3">
            <div className="flex items-center justify-between gap-4 text-xs font-bold text-muted">
              <span>Tổng sử dụng</span>
              <span className="text-fg">{overallUsage}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-badge">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" style={{ width: `${overallUsage}%` }} />
            </div>
            <p className="mt-2 text-xs text-muted">
              <span className="font-black text-fg">{report.overall.occupied}</span>/{report.overall.totalCapacity} vị trí đang dùng
            </p>
          </div>
        </div>
      </div>

      {groups.length === 0 ? (
        <p className="py-8 text-center text-sm text-subtle">Chưa có dữ liệu tầng đỗ xe.</p>
      ) : (
        <div className="grid max-h-[38rem] gap-4 overflow-y-auto p-4 sidebar-scrollbar">
          {groups.map((building) => (
            <BuildingOccupancyGroup key={building.buildingId} group={building} />
          ))}
        </div>
      )}
    </section>
  )
}

function BuildingOccupancyGroup({ group }: { group: BuildingGroup }) {
  const usage = group.totalCapacity > 0 ? Math.round((group.occupied / group.totalCapacity) * 100) : 0

  return (
    <article className="overflow-hidden rounded-3xl border border-theme bg-page/65 shadow-sm">
      <div className="border-b border-theme p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-lg font-black text-fg">{group.buildingName}</p>
            <p className="mt-1 text-xs text-muted">
              {group.floors.length} tầng · {group.occupied}/{group.totalCapacity} vị trí đang dùng
            </p>
          </div>
          <div className="rounded-2xl border border-theme bg-badge px-4 py-2 text-right">
            <p className="text-xl font-black text-fg">{usage}%</p>
            <p className="text-[10px] uppercase tracking-[0.12em] text-subtle">Sử dụng</p>
          </div>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-badge">
          <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400" style={{ width: `${usage}%` }} />
        </div>
      </div>

      <div className="grid gap-3 p-3">
        {group.floors.map((floorGroup) => (
          <FloorOccupancyGroup
            key={`${group.buildingId}-${floorGroup.floorNumber}`}
            floorNumber={floorGroup.floorNumber}
            floors={floorGroup.floors}
          />
        ))}
      </div>
    </article>
  )
}

function FloorOccupancyGroup({
  floorNumber,
  floors,
}: {
  floorNumber: string | number
  floors: ManagerOccupancyFloor[]
}) {
  const totalCapacity = floors.reduce((sum, floor) => sum + getCapacity(floor), 0)
  const occupied = floors.reduce((sum, floor) => sum + floor.occupied, 0)
  const usage = totalCapacity > 0 ? Math.round((occupied / totalCapacity) * 100) : 0

  return (
    <div className="overflow-hidden rounded-2xl border border-theme bg-badge">
      <div className="flex flex-col gap-3 border-b border-theme bg-page/45 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-black text-fg">Tầng {floorNumber}</p>
          <p className="mt-1 text-xs text-muted">
            {floors.length} khu · {occupied}/{totalCapacity} vị trí
          </p>
        </div>
        <span className="w-fit rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-black text-emerald-700 dark:text-emerald-200">
          {usage}% tải
        </span>
      </div>

      <div className="divide-y divide-[color:var(--border)]">
        {floors.map((floor) => (
          <OccupancyRow key={floor.floorId} floor={floor} />
        ))}
      </div>
    </div>
  )
}

function OccupancyRow({ floor }: { floor: ManagerOccupancyFloor }) {
  const usage = Math.min(100, Math.max(0, floor.utilizationPercent))
  const capacity = getCapacity(floor)
  const floorTypeLabel = floor.floorType ? FLOOR_TYPE_LABELS[floor.floorType] ?? floor.floorType : 'Chưa phân loại'
  const secondaryCount = (floor.reserved ?? 0) + (floor.maintenance ?? 0)

  return (
    <div className="bg-page/60 p-3 transition hover:bg-sky-500/5">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1.35fr)_5.5rem_5.5rem_5.5rem_minmax(9rem,0.95fr)] xl:items-center">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-xl bg-btn-primary px-3 py-1 text-xs font-black text-btn-primary-fg">
              Khu {getFloorSection(floor.section)}
            </span>
            <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold ${VEHICLE_TONES[floor.vehicleType]}`}>
              {VEHICLE_LABELS[floor.vehicleType]}
            </span>
            <span className="rounded-full border border-theme bg-badge px-2.5 py-1 text-[11px] font-bold text-muted">
              {floorTypeLabel}
            </span>
          </div>
          {floor.description && <p className="mt-1 truncate text-xs text-muted">{floor.description}</p>}
        </div>

        <Metric label="Đang đỗ" value={floor.occupied} />
        <Metric label="Còn trống" value={floor.empty} />
        <Metric label="Khác" value={secondaryCount} />

        <div className="rounded-xl border border-theme bg-badge p-3 xl:border-0 xl:bg-transparent xl:p-0">
          <div className="flex items-center justify-between gap-2 text-xs font-bold text-fg">
            <span>{floor.occupied}/{capacity}</span>
            <span>{usage}%</span>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-badge">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400" style={{ width: `${usage}%` }} />
          </div>
        </div>
      </div>

      {(floor.reserved || floor.maintenance) ? (
        <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted xl:ml-[calc(0px)]">
          <span className="rounded-full bg-badge px-2.5 py-1">Đặt trước {floor.reserved ?? 0}</span>
          <span className="rounded-full bg-badge px-2.5 py-1">Bảo trì {floor.maintenance ?? 0}</span>
        </div>
      ) : null}
    </div>
  )
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-theme bg-badge px-3 py-2 xl:block xl:border-0 xl:bg-transparent xl:px-0 xl:py-0">
      <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle xl:block">{label}</span>
      <span className="font-black text-fg xl:mt-1 xl:block">{value}</span>
    </div>
  )
}

function getCapacity(floor: ManagerOccupancyFloor) {
  return floor.totalCapacity ?? floor.totalSlots ?? floor.occupied + floor.empty
}

function buildOccupancyGroups(floors: ManagerOccupancyFloor[]) {
  const buildingMap = new Map<string, BuildingGroup>()

  floors.forEach((floor) => {
    const buildingId = floor.building?._id ?? 'unknown'
    const buildingName = floor.building?.name ?? 'Chưa xác định'
    const capacity = getCapacity(floor)
    const building = buildingMap.get(buildingId) ?? {
      buildingId,
      buildingName,
      totalCapacity: 0,
      occupied: 0,
      floors: [],
    }

    building.totalCapacity += capacity
    building.occupied += floor.occupied

    let floorGroup = building.floors.find((item) => String(item.floorNumber) === String(floor.floorNumber))
    if (!floorGroup) {
      floorGroup = { floorNumber: floor.floorNumber, floors: [] }
      building.floors.push(floorGroup)
    }

    floorGroup.floors.push(floor)
    buildingMap.set(buildingId, building)
  })

  return Array.from(buildingMap.values())
    .map((building) => ({
      ...building,
      floors: building.floors
        .map((floorGroup) => ({
          ...floorGroup,
          floors: floorGroup.floors.sort(compareSections),
        }))
        .sort((a, b) => Number(a.floorNumber) - Number(b.floorNumber)),
    }))
    .sort((a, b) => a.buildingName.localeCompare(b.buildingName, 'vi'))
}

function compareSections(a: ManagerOccupancyFloor, b: ManagerOccupancyFloor) {
  const sectionCompare = getFloorSection(a.section).localeCompare(getFloorSection(b.section), 'vi')
  if (sectionCompare !== 0) return sectionCompare
  return VEHICLE_LABELS[a.vehicleType].localeCompare(VEHICLE_LABELS[b.vehicleType], 'vi')
}
