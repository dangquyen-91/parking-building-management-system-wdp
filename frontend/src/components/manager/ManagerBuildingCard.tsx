import { useId, useState } from 'react'
import type { ManagerBuildingSummary } from '../../hooks/useManagerBuildings'

type ManagerBuildingCardProps = {
  building: ManagerBuildingSummary
  onEdit?: (building: ManagerBuildingSummary) => void
  onEditFloor?: (floor: ManagerBuildingSummary['floors'][number]) => void
}

function formatVehicleType(value: ManagerBuildingSummary['floors'][number]['vehicleType']) {
  return value === 'motorcycle' ? 'Motorcycle' : 'Car'
}

function formatFloorType(value: ManagerBuildingSummary['floors'][number]['floorType']) {
  return value === 'resident' ? 'Resident' : 'Visitor'
}

export function ManagerBuildingCard({ building, onEdit, onEditFloor }: ManagerBuildingCardProps) {
  const [isOpen, setIsOpen] = useState(false)
  const contentId = useId()

  return (
    <article className="rounded-lg border border-theme bg-badge p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-base font-semibold text-fg">{building.name}</p>
            <p className="mt-1 text-xs text-subtle">{building.address}</p>
            {building.description && (
              <p className="mt-2 text-xs text-muted">{building.description}</p>
            )}
            <p className="mt-2 text-xs text-subtle">
              {building.isActive ? 'Active' : 'Inactive'}
            </p>
          </div>
          {onEdit && (
            <button
              type="button"
              className="h-8 rounded-lg border border-theme px-3 text-xs font-medium text-subtle transition-colors hover:text-fg"
              onClick={() => onEdit(building)}
            >
              Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 text-right">
          <div>
            <p className="text-xs text-subtle">Floors</p>
            <p className="mt-1 text-base font-semibold text-fg">{building.floorCount}</p>
            <p className="mt-1 text-[11px] text-muted">{building.activeFloors} active</p>
          </div>
          <div>
            <p className="text-xs text-subtle">Total slots</p>
            <p className="mt-1 text-base font-semibold text-fg">{building.totalSlots}</p>
            <p className="mt-1 text-[11px] text-muted">Total capacity</p>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 flex w-full items-center justify-between rounded-lg border border-theme bg-page/40 px-3 py-2 text-left text-sm font-medium text-fg transition-colors hover:bg-page/60"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span>{isOpen ? 'Hide floor list' : 'View floor list'}</span>
        <span className="text-xs text-subtle">
          {building.floors.length} floor
        </span>
      </button>

      {isOpen && (
        <div id={contentId} className="mt-3 grid gap-2">
          {building.floors.length === 0 ? (
            <div className="rounded-lg border border-theme bg-page/40 px-3 py-2 text-xs text-muted">
              No floors have been created.
            </div>
          ) : (
            building.floors.map((floor) => (
              <div
                key={floor.id}
                className="flex flex-col gap-2 rounded-lg border border-theme bg-page/40 px-3 py-2 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-fg">Floor {floor.floorNumber}</p>
                  <p className="mt-1 text-xs text-subtle">
                    {formatFloorType(floor.floorType)} / {formatVehicleType(floor.vehicleType)}
                  </p>
                </div>
                <div className="flex items-center justify-between gap-3 sm:justify-end sm:text-right">
                  {onEditFloor && (
                    <button
                      type="button"
                      className="h-8 rounded-lg border border-theme px-3 text-xs font-medium text-subtle transition-colors hover:text-fg"
                      onClick={() => onEditFloor(floor)}
                    >
                      Edit
                    </button>
                  )}
                  <div>
                    <p className="text-xs text-subtle">Total slots</p>
                    <p className="mt-1 text-sm font-semibold text-fg">{floor.totalSlots}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </article>
  )
}
