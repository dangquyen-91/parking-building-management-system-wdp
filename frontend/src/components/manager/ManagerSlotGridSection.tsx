import { ManagerStatusBadge } from './ManagerStatusBadge'
import type { ParkingSlot } from '../../services/managerParkingSlotApi'

type BadgeStatus = 'available' | 'occupied' | 'reserved' | 'maintenance'

const SLOT_STATUS_LABELS: Record<ParkingSlot['status'], string> = {
  empty: 'Trống',
  occupied: 'Đang dùng',
  reserved: 'Đã đặt',
  maintenance: 'Bảo trì',
}

const SLOT_STATUS_DETAILS: Record<ParkingSlot['status'], string> = {
  empty: 'Có thể nhận xe',
  occupied: 'Đang có xe trong ô',
  reserved: 'Đã giữ chỗ',
  maintenance: 'Tạm ngưng sử dụng',
}

const VEHICLE_TYPE_LABELS: Record<ParkingSlot['vehicleType'], string> = {
  car: 'Ô tô',
  motorcycle: 'Xe máy',
}

type ManagerSlotGridSectionProps = {
  buildingName?: string
  floorNumber?: number
  slots: ParkingSlot[]
  onEdit: (slot: ParkingSlot) => void
  onDelete: (slot: ParkingSlot) => void
}

export function ManagerSlotGridSection({
  buildingName,
  floorNumber,
  slots,
  onEdit,
  onDelete,
}: ManagerSlotGridSectionProps) {
  return (
    <div className="liquid-glass-card rounded-lg border border-theme bg-badge p-4 md:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-subtle">Tầng ô tô</p>
          <h3 className="mt-2 text-lg font-semibold text-fg">
            {buildingName ? `${buildingName} / ` : ''}Tầng {floorNumber ?? '-'}
          </h3>
        </div>
        <div className="text-xs text-muted">{slots.length} ô đỗ</div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {slots.map((slot) => {
          const badgeStatus: BadgeStatus = slot.status === 'empty' ? 'available' : slot.status

          return (
            <div key={slot._id} className="flex flex-col gap-2 rounded-lg border border-theme bg-page/70 p-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-fg">{slot.slotCode}</p>
                  <p className="text-[11px] font-medium text-fg">{VEHICLE_TYPE_LABELS[slot.vehicleType]}</p>
                </div>
                <ManagerStatusBadge status={badgeStatus} label={SLOT_STATUS_LABELS[slot.status]} />
              </div>
              <p className="text-[11px] font-medium text-subtle">{SLOT_STATUS_DETAILS[slot.status]}</p>
              {slot.note && <p className="text-[11px] text-muted">{slot.note}</p>}
              <div className="mt-auto flex items-center justify-between gap-2 text-[11px]">
                <button type="button" className="font-semibold text-fg hover:text-fg" onClick={() => onEdit(slot)}>
                  Sửa
                </button>
                <button
                  type="button"
                  className="font-semibold text-rose-700 hover:text-rose-800 dark:text-rose-200 dark:hover:text-rose-100"
                  onClick={() => onDelete(slot)}
                >
                  Xóa
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
