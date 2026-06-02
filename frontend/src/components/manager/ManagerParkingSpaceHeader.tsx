import { ManagerPageHeader } from './index'
import type { Building, Floor } from '../../services/managerBuildingsApi'

type ManagerParkingSpaceHeaderProps = {
  buildings: Building[]
  floors: Floor[]
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
        <div className="grid w-full gap-3 lg:min-w-[36rem] lg:max-w-[42rem]">
          <div className="flex flex-col gap-3 rounded-lg border border-theme bg-badge/60 p-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-medium text-subtle">
              Building
              <select
                className="h-10 w-full rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-btn-primary"
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
              <label className="grid gap-1 text-xs font-medium text-subtle">
              Floor
              <select
                className="h-10 w-full rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-btn-primary"
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

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition hover:opacity-90"
                onClick={onCreateSlot}
              >
                Create car slot
              </button>
              <button
                type="button"
                className="h-10 rounded-lg border border-theme px-4 text-sm font-semibold text-fg transition hover:bg-badge"
                onClick={onCreateRow}
              >
                Create motorcycle row
              </button>
            </div>
          </div>
        </div>
      }
    />
  )
}
