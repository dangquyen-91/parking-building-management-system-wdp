import { ManagerPageHeader } from '../common/ManagerPageHeader'
import type { Building, Floor } from '../../../services/managerBuildingsApi'
import { getFloorSection } from '../../../utils/floorLabel'

type ManagerParkingSpaceHeaderProps = {
  buildings: Building[]
  floorNumbers: number[]
  sections: Floor[]
  buildingFilter: string
  floorNumberFilter: string
  sectionFilter: string
  onBuildingFilterChange: (value: string) => void
  onFloorNumberFilterChange: (value: string) => void
  onSectionFilterChange: (value: string) => void
  onCreateSlot: () => void
  onCreateRow: () => void
}

const selectClass =
  'h-10 w-full rounded-lg border border-theme bg-page px-3 text-sm font-semibold text-fg outline-none transition focus:border-btn-primary'

function formatVehicleType(vehicleType: Floor['vehicleType']) {
  return vehicleType === 'motorcycle' ? 'Xe máy' : 'Ô tô'
}

function formatFloorType(floorType: Floor['floorType']) {
  return floorType === 'resident' ? 'Cư dân' : 'Khách vãng lai'
}

export function ManagerParkingSpaceHeader({
  buildings,
  floorNumbers,
  sections,
  buildingFilter,
  floorNumberFilter,
  sectionFilter,
  onBuildingFilterChange,
  onFloorNumberFilterChange,
  onSectionFilterChange,
  onCreateSlot,
  onCreateRow,
}: ManagerParkingSpaceHeaderProps) {
  return (
    <ManagerPageHeader
      eyebrow="Quản lý // Chỗ đỗ"
      title="Chỗ đỗ"
      description="Chọn tòa nhà, tầng và khu để xem đúng nhóm chỗ đỗ cần quản lý."
      actions={
        <div className="w-full lg:min-w-[42rem] lg:max-w-[56rem]">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-1 text-xs font-bold text-subtle">
              Tòa nhà
              <select
                className={selectClass}
                value={buildingFilter}
                onChange={(event) => onBuildingFilterChange(event.target.value)}
              >
                <option value="all">Tất cả tòa nhà</option>
                {buildings.map((building) => (
                  <option key={building._id} value={building._id}>
                    {building.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-xs font-bold text-subtle">
              Tầng
              <select
                className={selectClass}
                value={floorNumberFilter}
                onChange={(event) => onFloorNumberFilterChange(event.target.value)}
              >
                <option value="all">Tất cả tầng</option>
                {floorNumbers.map((floorNumber) => (
                  <option key={floorNumber} value={String(floorNumber)}>
                    Tầng {floorNumber}
                  </option>
                ))}
              </select>
            </label>

            <label className="grid gap-1 text-xs font-bold text-subtle">
              Khu
              <select
                className={selectClass}
                value={sectionFilter}
                onChange={(event) => onSectionFilterChange(event.target.value)}
              >
                <option value="all">
                  {floorNumberFilter === 'all' ? 'Tất cả khu' : `Tất cả khu tầng ${floorNumberFilter}`}
                </option>
                {sections.map((floor) => (
                  <option key={floor._id} value={floor._id}>
                    Khu {getFloorSection(floor.section)} · {formatVehicleType(floor.vehicleType)} ·{' '}
                    {formatFloorType(floor.floorType)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-bold text-btn-primary-fg transition hover:opacity-90"
              onClick={onCreateSlot}
            >
              Tạo ô đỗ ô tô
            </button>
            <button
              type="button"
              className="h-10 rounded-lg border border-theme/70 bg-page/20 px-4 text-sm font-bold text-fg transition hover:bg-page/50"
              onClick={onCreateRow}
            >
              Tạo hàng xe máy
            </button>
          </div>
        </div>
      }
    />
  )
}
