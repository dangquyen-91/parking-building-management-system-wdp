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
      eyebrow="Quản lý // Chỗ đỗ"
      title="Chỗ đỗ"
      description="Quản lý ô đỗ ô tô, hàng xe máy, trạng thái và ghi chú vận hành."
      actions={
        <div className="grid w-full gap-3 lg:min-w-[36rem] lg:max-w-[42rem]">
          <div className="flex flex-col gap-3 rounded-lg border border-theme bg-badge/60 p-3 sm:flex-row sm:items-end sm:justify-between">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-xs font-medium text-subtle">
                Tòa nhà
                <select
                  className="h-10 w-full rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-btn-primary"
                  value={buildingFilter}
                  onChange={(event) => onBuildingFilterChange(event.target.value)}
                >
                  <option value="all">Tất cả</option>
                  {buildings.map((building) => (
                    <option key={building._id} value={building._id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-medium text-subtle">
                Tầng
                <select
                  className="h-10 w-full rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-btn-primary"
                  value={floorFilter}
                  onChange={(event) => onFloorFilterChange(event.target.value)}
                >
                  <option value="all">Tất cả</option>
                  {floors.map((floor) => (
                    <option key={floor._id} value={floor._id}>
                      Tầng {floor.floorNumber}
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
                Tạo ô đỗ ô tô
              </button>
              <button
                type="button"
                className="h-10 rounded-lg border border-theme px-4 text-sm font-semibold text-fg transition hover:bg-badge"
                onClick={onCreateRow}
              >
                Tạo hàng xe máy
              </button>
            </div>
          </div>
        </div>
      }
    />
  )
}
