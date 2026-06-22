import type { Building, Floor } from '../../../services/managerBuildingsApi'
import { AdminField, adminInputClass } from '../common/AdminFormPrimitives'
import { AdminPageShell } from '../common/AdminPageShell'

export function AdminParkingSpaceHeader({ buildings, floors, buildingFilter, floorFilter, onBuildingFilterChange, onFloorFilterChange, onCreateSlot, onCreateRow }: { buildings: Building[]; floors: Floor[]; buildingFilter: string; floorFilter: string; onBuildingFilterChange: (value: string) => void; onFloorFilterChange: (value: string) => void; onCreateSlot: () => void; onCreateRow: () => void }) {
  return (
    <AdminPageShell
      eyebrow="Admin // Chỗ đỗ"
      title="Quản lý chỗ đỗ"
      description="Quản lý ô đỗ ô tô, hàng xe máy, trạng thái và sức chứa."
      actions={
        <div className="grid w-full gap-3 lg:min-w-[38rem]">
          <div className="flex flex-col gap-3 rounded-lg border border-theme bg-badge p-3 sm:flex-row sm:items-end">
            <div className="grid flex-1 gap-3 sm:grid-cols-2">
              <AdminField label="Tòa nhà"><select className={adminInputClass} value={buildingFilter} onChange={(event) => onBuildingFilterChange(event.target.value)}><option value="all">Tất cả</option>{buildings.map((item) => <option key={item._id} value={item._id}>{item.name}</option>)}</select></AdminField>
              <AdminField label="Tầng"><select className={adminInputClass} value={floorFilter} onChange={(event) => onFloorFilterChange(event.target.value)}><option value="all">Tất cả</option>{floors.map((item) => <option key={item._id} value={item._id}>Tầng {item.floorNumber}</option>)}</select></AdminField>
            </div>
            <div className="flex gap-2">
              <button className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg" onClick={onCreateSlot}>Tạo ô ô tô</button>
              <button className="h-10 rounded-lg border border-theme px-4 text-sm font-semibold text-fg" onClick={onCreateRow}>Tạo hàng xe máy</button>
            </div>
          </div>
        </div>
      }
    />
  )
}
