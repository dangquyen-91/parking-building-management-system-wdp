import { useState } from 'react'
import type { Building, Floor } from '../../../services/managerBuildingsApi'
import type { ParkingRow } from '../../../services/managerParkingRowApi'
import type { ParkingSlot } from '../../../services/managerParkingSlotApi'
import { getFloorSection } from '../../../utils/floorLabel'
import { AdminParkingSlotDiagram } from './AdminParkingSlotDiagram'

type AdminParkingSpaceListProps = {
  isLoading: boolean
  hasError: boolean
  filteredSlots: ParkingSlot[]
  filteredRows: ParkingRow[]
  visibleSlotFloors: Floor[]
  visibleRowFloors: Floor[]
  slotsByFloor: Map<string, ParkingSlot[]>
  rowsByFloor: Map<string, ParkingRow[]>
  buildingMap: Map<string, Building>
  onEditSlot: (slot: ParkingSlot) => void
  onDeleteSlot: (slot: ParkingSlot) => void
  onEditRow: (row: ParkingRow) => void
}

type FloorGroup = {
  key: string
  buildingName?: string
  floorNumber: number | string
  floors: Floor[]
}

export function AdminParkingSpaceList({
  isLoading,
  hasError,
  filteredSlots,
  filteredRows,
  visibleSlotFloors,
  visibleRowFloors,
  slotsByFloor,
  rowsByFloor,
  buildingMap,
  onEditSlot,
  onDeleteSlot,
  onEditRow,
}: AdminParkingSpaceListProps) {
  if (hasError) return null
  if (isLoading) return <Empty text="Đang tải dữ liệu chỗ đỗ..." />
  if (!filteredSlots.length && !filteredRows.length) return <Empty text="Không có chỗ đỗ phù hợp." />

  const slotGroups = groupFloorsByLevel(visibleSlotFloors, buildingMap)
  const rowGroups = groupFloorsByLevel(visibleRowFloors, buildingMap)

  return (
    <section className="grid gap-5">
      {slotGroups.map((group) => (
        <SlotFloorGroup
          key={group.key}
          group={group}
          slotsByFloor={slotsByFloor}
          onEditSlot={onEditSlot}
          onDeleteSlot={onDeleteSlot}
        />
      ))}

      {rowGroups.map((group) => (
        <RowFloorGroup key={group.key} group={group} rowsByFloor={rowsByFloor} onEditRow={onEditRow} />
      ))}
    </section>
  )
}

function SlotFloorGroup({
  group,
  slotsByFloor,
  onEditSlot,
  onDeleteSlot,
}: {
  group: FloorGroup
  slotsByFloor: Map<string, ParkingSlot[]>
  onEditSlot: (slot: ParkingSlot) => void
  onDeleteSlot: (slot: ParkingSlot) => void
}) {
  const [selectedFloorId, setSelectedFloorId] = useState(group.floors[0]?._id ?? '')
  const selectedFloor = group.floors.find((floor) => floor._id === selectedFloorId) ?? group.floors[0]
  const selectedSlots = selectedFloor ? slotsByFloor.get(selectedFloor._id) ?? [] : []
  const selectedSection = getFloorSection(selectedFloor?.section)

  return (
    <section className="liquid-glass-card rounded-[1.75rem] border border-sky-500/15 p-4 shadow-sm md:p-5">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">
            {group.buildingName ?? 'Tòa nhà'} // Tầng {group.floorNumber} / Khu {selectedSection}
          </p>
          <h2 className="mt-1 text-lg font-black text-fg">Sơ đồ ô đỗ ô tô</h2>
        </div>
        <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-200">
          {selectedSlots.length} ô
        </span>
      </div>

      <SectionTabs floors={group.floors} selectedFloorId={selectedFloor?._id ?? ''} countsByFloor={slotsByFloor} onSelect={setSelectedFloorId} />

      <div className="mt-4 max-h-[34rem] overflow-y-auto pr-1">
        <AdminParkingSlotDiagram slots={selectedSlots} onEdit={onEditSlot} onDelete={onDeleteSlot} />
      </div>
    </section>
  )
}

function RowFloorGroup({
  group,
  rowsByFloor,
  onEditRow,
}: {
  group: FloorGroup
  rowsByFloor: Map<string, ParkingRow[]>
  onEditRow: (row: ParkingRow) => void
}) {
  const [selectedFloorId, setSelectedFloorId] = useState(group.floors[0]?._id ?? '')
  const selectedFloor = group.floors.find((floor) => floor._id === selectedFloorId) ?? group.floors[0]
  const selectedRows = selectedFloor ? rowsByFloor.get(selectedFloor._id) ?? [] : []
  const selectedSection = getFloorSection(selectedFloor?.section)

  return (
    <section className="liquid-glass-card rounded-lg p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">
            {group.buildingName ?? 'Tòa nhà'} // Tầng {group.floorNumber} / Khu {selectedSection}
          </p>
          <h2 className="mt-1 text-base font-semibold text-fg">Hàng xe máy</h2>
        </div>
        <span className="rounded-full border border-theme bg-badge px-3 py-1 text-xs font-bold text-fg">
          {selectedRows.length} hàng
        </span>
      </div>

      <SectionTabs floors={group.floors} selectedFloorId={selectedFloor?._id ?? ''} countsByFloor={rowsByFloor} onSelect={setSelectedFloorId} />

      <div className="mt-4 max-h-[26rem] overflow-y-auto pr-1">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {selectedRows.map((row) => (
            <article key={row._id} className="rounded-lg border border-theme bg-badge p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-fg">{row.rowCode}</p>
                  <p className="mt-1 text-xs text-subtle">
                    {row.occupiedCount}/{row.capacity} đang dùng
                  </p>
                </div>
                <button className="rounded-lg border border-theme px-2.5 py-1 text-xs text-fg" onClick={() => onEditRow(row)}>
                  Sửa
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

function SectionTabs<T>({
  floors,
  selectedFloorId,
  countsByFloor,
  onSelect,
}: {
  floors: Floor[]
  selectedFloorId: string
  countsByFloor: Map<string, T[]>
  onSelect: (floorId: string) => void
}) {
  if (floors.length <= 1) {
    const floor = floors[0]
    if (!floor) return null

    return (
      <div className="flex gap-2 overflow-x-auto pb-1">
        <span className="shrink-0 rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-200">
          Khu {getFloorSection(floor.section)} ({countsByFloor.get(floor._id)?.length ?? 0})
        </span>
      </div>
    )
  }

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {floors.map((floor) => {
        const active = floor._id === selectedFloorId
        return (
          <button
            key={floor._id}
            type="button"
            onClick={() => onSelect(floor._id)}
            className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold transition ${
              active
                ? 'border-sky-500 bg-sky-500 text-white shadow-sm'
                : 'border-theme bg-page/70 text-fg hover:border-sky-500/40 hover:bg-sky-500/10'
            }`}
          >
            Khu {getFloorSection(floor.section)} ({countsByFloor.get(floor._id)?.length ?? 0})
          </button>
        )
      })}
    </div>
  )
}

function groupFloorsByLevel(floors: Floor[], buildingMap: Map<string, Building>): FloorGroup[] {
  const groups = new Map<string, FloorGroup>()

  floors.forEach((floor) => {
    const buildingId = getBuildingId(floor)
    const floorNumber = floor.floorNumber ?? '-'
    const key = `${buildingId || 'unknown'}-${floorNumber}`
    const current = groups.get(key)

    if (current) current.floors.push(floor)
    else groups.set(key, { key, buildingName: buildingId ? buildingMap.get(buildingId)?.name : undefined, floorNumber, floors: [floor] })
  })

  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      floors: [...group.floors].sort((a, b) => getFloorSection(a.section).localeCompare(getFloorSection(b.section))),
    }))
    .sort((a, b) => {
      const byBuilding = (a.buildingName ?? '').localeCompare(b.buildingName ?? '')
      if (byBuilding) return byBuilding
      return Number(a.floorNumber) - Number(b.floorNumber)
    })
}

function getBuildingId(floor: Floor) {
  return typeof floor.buildingId === 'string' ? floor.buildingId : floor.buildingId?._id
}

function Empty({ text }: { text: string }) {
  return <div className="liquid-glass-card rounded-lg p-5 text-sm text-muted">{text}</div>
}
