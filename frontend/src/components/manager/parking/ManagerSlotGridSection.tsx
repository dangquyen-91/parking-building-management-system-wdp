import { Button } from '@/components/ui/button'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { ParkingSlot } from '../../../services/managerParkingSlotApi'
import { getFloorSection } from '../../../utils/floorLabel'

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

const FLOOR_TYPE_LABELS: Record<Floor['floorType'], string> = {
  resident: 'Cư dân',
  visitor: 'Khách vãng lai',
}

const SLOT_CARD_TONES: Record<ParkingSlot['status'], string> = {
  empty: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
  occupied: 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-200',
  reserved: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200',
  maintenance: 'border-rose-500/30 bg-rose-500/10 text-rose-700 dark:text-rose-200',
}

const SLOT_DOT_TONES: Record<ParkingSlot['status'], string> = {
  empty: 'bg-emerald-500',
  occupied: 'bg-sky-500',
  reserved: 'bg-amber-500',
  maintenance: 'bg-rose-500',
}

type ManagerSlotGridSectionProps = {
  buildingName?: string
  floorNumber?: number
  section?: string
  floorType: Floor['floorType']
  slots: ParkingSlot[]
  onEdit: (slot: ParkingSlot) => void
  onDelete: (slot: ParkingSlot) => void
}

function getBadgeStatus(status: ParkingSlot['status']): BadgeStatus {
  return status === 'empty' ? 'available' : status
}

export function ManagerSlotGridSection({
  buildingName,
  floorNumber,
  section,
  floorType,
  slots,
  onEdit,
  onDelete,
}: ManagerSlotGridSectionProps) {
  const availableCount = slots.filter((slot) => slot.status === 'empty').length

  return (
    <div className="bg-card text-card-foreground ring-1 ring-border overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="border-b border-border p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Khu ô tô</p>
            <h3 className="mt-2 text-xl font-black text-foreground">
              {buildingName ? `${buildingName} / ` : ''}Tầng {floorNumber ?? '-'} · Khu {getFloorSection(section)}
            </h3>
            <div className="mt-3 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full border border-border bg-background/60 px-3 py-1 font-bold text-foreground">Ô tô</span>
              <span className="rounded-full border border-border bg-background/60 px-3 py-1 font-bold text-foreground">
                {FLOOR_TYPE_LABELS[floorType]}
              </span>
              <span className="rounded-full bg-emerald-500/10 px-3 py-1 font-black text-emerald-700 dark:text-emerald-200">
                Còn {availableCount}/{slots.length} ô
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background/50 px-4 py-3 text-right">
            <p className="text-2xl font-black text-foreground">{slots.length}</p>
            <p className="text-xs text-muted-foreground">Tổng ô đỗ</p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
          {(Object.keys(SLOT_STATUS_LABELS) as ParkingSlot['status'][]).map((status) => (
            <ManagerStatusBadge key={status} status={getBadgeStatus(status)} label={SLOT_STATUS_LABELS[status]} />
          ))}
        </div>
      </div>

      <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
        {slots.map((slot) => (
          <article
            key={slot._id}
            className={`group relative flex min-h-32 flex-col overflow-hidden rounded-xl border p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${SLOT_CARD_TONES[slot.status]}`}
          >
            <span className={`absolute right-3 top-3 size-2.5 rounded-full ${SLOT_DOT_TONES[slot.status]}`} />

            <Button
              type="button"
              variant="ghost"
              className="h-auto w-full flex-1 flex-col items-start justify-start gap-0 bg-transparent p-0 text-left text-current hover:bg-transparent hover:text-current"
              onClick={() => onEdit(slot)}
            >
              <p className="text-xl font-black tracking-[0.08em]">{slot.slotCode}</p>
              <p className="mt-1 text-xs font-black uppercase tracking-[0.12em]">{SLOT_STATUS_LABELS[slot.status]}</p>
              <p className="mt-2 min-h-5 text-xs leading-relaxed opacity-80">
                {slot.note || SLOT_STATUS_DETAILS[slot.status]}
              </p>
            </Button>

            <div className="mt-2 flex items-center justify-between gap-2 border-t border-current/15 pt-2 text-xs">
              <Button type="button" variant="outline" size="sm" className="h-8 px-3" onClick={() => onEdit(slot)}>
                Sửa
              </Button>
              <Button type="button" variant="destructive" size="sm" className="h-8 px-3" onClick={() => onDelete(slot)}>
                Xóa
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  )
}



