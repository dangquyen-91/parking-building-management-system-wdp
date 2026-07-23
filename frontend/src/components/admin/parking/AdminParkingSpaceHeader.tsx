import type { Building, Floor } from '../../../services/managerBuildingsApi'
import { formatFloorLabel } from '../../../utils/floorLabel'
import { AdminField } from '../common/AdminFormPrimitives'
import { AdminPageShell } from '../common/AdminPageShell'
import { Button } from '../../ui/button'
import { NativeSelect, NativeSelectOption } from '../../ui/native-select'

type AdminParkingSpaceHeaderProps = {
  buildings: Building[]
  floors: Floor[]
  buildingFilter: string
  floorFilter: string
  onBuildingFilterChange: (value: string) => void
  onFloorFilterChange: (value: string) => void
  onCreateSlot: () => void
  onCreateRow: () => void
}

export function AdminParkingSpaceHeader({
  buildings,
  floors,
  buildingFilter,
  floorFilter,
  onBuildingFilterChange,
  onFloorFilterChange,
  onCreateSlot,
  onCreateRow,
}: AdminParkingSpaceHeaderProps) {
  return (
    <AdminPageShell
      eyebrow="Admin // Chỗ đỗ"
      title="Quản lý chỗ đỗ"
      description="Quản lý ô đỗ ô tô, hàng xe máy, trạng thái và sức chứa."
      actions={
        <div className="grid w-full min-w-0 gap-3 xl:max-w-[52rem]">
          <div className="flex min-w-0 flex-col gap-3 rounded-lg border border-violet-500/15 bg-card/90 p-3 sm:flex-row sm:items-end">
            <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
              <AdminField label="Tòa nhà">
                <NativeSelect className="w-full" value={buildingFilter} onChange={(event) => onBuildingFilterChange(event.target.value)}>
                  <NativeSelectOption value="all">Tất cả</NativeSelectOption>
                  {buildings.map((item) => (
                    <NativeSelectOption key={item._id} value={item._id}>{item.name}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </AdminField>
              <AdminField label="Tầng / Khu">
                <NativeSelect className="w-full" value={floorFilter} onChange={(event) => onFloorFilterChange(event.target.value)}>
                  <NativeSelectOption value="all">Tất cả</NativeSelectOption>
                  {floors.map((item) => (
                    <NativeSelectOption key={item._id} value={item._id}>{formatFloorLabel(item)}</NativeSelectOption>
                  ))}
                </NativeSelect>
              </AdminField>
            </div>
            <div className="grid shrink-0 gap-2 sm:grid-cols-2">
              <Button size="lg" className="whitespace-normal" onClick={onCreateSlot}>Tạo ô ô tô</Button>
              <Button size="lg" variant="outline" className="whitespace-normal" onClick={onCreateRow}>Tạo hàng xe máy</Button>
            </div>
          </div>
        </div>
      }
    />
  )
}

