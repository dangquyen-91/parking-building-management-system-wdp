import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { NativeSelect } from '@/components/ui/native-select'
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
        <div className="w-full xl:min-w-[36rem] xl:max-w-[52rem]">
          <div className="grid gap-3 md:grid-cols-3">
            <Label className="grid gap-2 text-xs font-medium text-muted-foreground">
              Tòa nhà
              <NativeSelect
                className="w-full"
                value={buildingFilter}
                onChange={(event) => onBuildingFilterChange(event.target.value)}
              >
                <option value="all">Tất cả tòa nhà</option>
                {buildings.map((building) => (
                  <option key={building._id} value={building._id}>
                    {building.name}
                  </option>
                ))}
              </NativeSelect>
            </Label>

            <Label className="grid gap-2 text-xs font-medium text-muted-foreground">
              Tầng
              <NativeSelect
                className="w-full"
                value={floorNumberFilter}
                onChange={(event) => onFloorNumberFilterChange(event.target.value)}
              >
                <option value="all">Tất cả tầng</option>
                {floorNumbers.map((floorNumber) => (
                  <option key={floorNumber} value={String(floorNumber)}>
                    Tầng {floorNumber}
                  </option>
                ))}
              </NativeSelect>
            </Label>

            <Label className="grid gap-2 text-xs font-medium text-muted-foreground">
              Khu
              <NativeSelect
                className="w-full"
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
              </NativeSelect>
            </Label>
          </div>

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              type="button"
              size="lg"
              onClick={onCreateSlot}
            >
              Tạo ô đỗ ô tô
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onCreateRow}
            >
              Tạo hàng xe máy
            </Button>
          </div>
        </div>
      }
    />
  )
}




