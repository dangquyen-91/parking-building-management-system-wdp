import { ManagerRowGridSection } from './ManagerRowGridSection'
import { ManagerSlotGridSection } from './ManagerSlotGridSection'
import type { Building, Floor } from '../../services/managerBuildingsApi'
import type { ParkingRow } from '../../services/managerParkingRowApi'
import type { ParkingSlot } from '../../services/managerParkingSlotApi'

type ManagerParkingSpaceListProps = {
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

function getFloorBuildingId(floor: Floor) {
  if (typeof floor.buildingId === 'string') return floor.buildingId
  return floor.buildingId?._id
}

export function ManagerParkingSpaceList({
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
}: ManagerParkingSpaceListProps) {
  if (hasError) return null

  if (isLoading) {
    return (
      <div className="liquid-glass-card rounded-lg border border-theme bg-badge p-4 text-sm text-muted">
        Loading parking spaces...
      </div>
    )
  }

  if (filteredSlots.length === 0 && filteredRows.length === 0) {
    return (
      <div className="liquid-glass-card rounded-lg border border-theme bg-badge p-4 text-sm text-muted">
        No parking spaces match the current filters.
      </div>
    )
  }

  return (
    <section className="grid gap-5">
      {visibleSlotFloors.map((floor) => {
        const buildingId = getFloorBuildingId(floor)
        const building = buildingId ? buildingMap.get(buildingId) : undefined
        const groupedSlots = slotsByFloor.get(floor._id) ?? []

        return (
          <ManagerSlotGridSection
            key={floor._id}
            buildingName={building?.name}
            floorNumber={floor.floorNumber}
            slots={groupedSlots}
            onEdit={onEditSlot}
            onDelete={onDeleteSlot}
          />
        )
      })}
      {visibleRowFloors.map((floor) => {
        const buildingId = getFloorBuildingId(floor)
        const building = buildingId ? buildingMap.get(buildingId) : undefined
        const groupedRows = rowsByFloor.get(floor._id) ?? []

        return (
          <ManagerRowGridSection
            key={floor._id}
            buildingName={building?.name}
            floorNumber={floor.floorNumber}
            rows={groupedRows}
            onEdit={onEditRow}
          />
        )
      })}
    </section>
  )
}
