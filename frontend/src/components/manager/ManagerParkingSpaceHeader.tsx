import { ManagerPageHeader, ManagerStatCard } from './index'
import type { Building, Floor } from '../../services/managerBuildingsApi'

type ParkingSpaceStats = {
  totalSlots: number
  totalRows: number
  maintenanceSlots: number
  occupiedSlots: number
  rowCapacity: number
  rowOccupied: number
}

type ManagerParkingSpaceHeaderProps = {
  buildings: Building[]
  floors: Floor[]
  stats: ParkingSpaceStats
  buildingFilter: string
  floorFilter: string
  onBuildingFilterChange: (value: string) => void
  onFloorFilterChange: (value: string) => void
  onCreateSlot: () => void
  onCreateRow: () => void
}

export function ManagerParkingSpaceHeader({
  buildings,
  floors,
  stats,
  buildingFilter,
  floorFilter,
  onBuildingFilterChange,
  onFloorFilterChange,
  onCreateSlot,
  onCreateRow,
}: ManagerParkingSpaceHeaderProps) {
  return (
    <ManagerPageHeader
      eyebrow="Manager // Slots"
      title="Slots & Zones"
      description="Manage parking slots, status, and assignment details."
      actions={
        <div className="flex flex-col gap-3 sm:items-end">
          <div className="flex flex-wrap justify-end gap-2">
            <button
              type="button"
              className="h-10 rounded-lg border border-theme px-4 text-sm font-semibold text-fg hover:text-fg"
              onClick={onCreateRow}
            >
              Create motorcycle row
            </button>
            <button
              type="button"
              className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg"
              onClick={onCreateSlot}
            >
              Create car slot
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:min-w-[32rem] sm:grid-cols-4">
            <ManagerStatCard label="Car slots" value={stats.totalSlots} detail={`${stats.occupiedSlots} occupied`} />
            <ManagerStatCard label="Rows" value={stats.totalRows} detail="Motorcycle rows" />
            <ManagerStatCard label="Moto capacity" value={stats.rowCapacity} detail={`${stats.rowOccupied} occupied`} />
            <ManagerStatCard label="Maintenance" value={stats.maintenanceSlots} detail="Car slots" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="grid gap-1 text-xs text-subtle">
              Building
              <select
                className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
                value={buildingFilter}
                onChange={(event) => onBuildingFilterChange(event.target.value)}
              >
                <option value="all">All</option>
                {buildings.map((building) => (
                  <option key={building._id} value={building._id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-xs text-subtle">
              Floor
              <select
                className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
                value={floorFilter}
                onChange={(event) => onFloorFilterChange(event.target.value)}
              >
                <option value="all">All</option>
                {floors.map((floor) => (
                  <option key={floor._id} value={floor._id}>
                    Floor {floor.floorNumber}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      }
    />
  )
}
