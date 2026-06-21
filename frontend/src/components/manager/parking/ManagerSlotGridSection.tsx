import { ManagerStatusBadge } from '../common/ManagerStatusBadge'
import type { ParkingSlot } from '../../../services/managerParkingSlotApi'

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

const SLOT_TONES: Record<ParkingSlot['status'], string> = {
  empty: 'bg-emerald-500',
  occupied: 'bg-sky-500',
  reserved: 'bg-amber-500',
  maintenance: 'bg-rose-500',
}

type SlotBank = {
  id: string
  slots: ParkingSlot[]
  side: 'left' | 'right'
}

type ManagerSlotGridSectionProps = {
  buildingName?: string
  floorNumber?: number
  slots: ParkingSlot[]
  onEdit: (slot: ParkingSlot) => void
  onDelete: (slot: ParkingSlot) => void
}

function splitSlotsIntoBanks(slots: ParkingSlot[]): SlotBank[] {
  const bankCount = Math.min(4, Math.max(1, slots.length))
  const bankSize = Math.ceil(slots.length / bankCount)
  const banks: SlotBank[] = []

  for (let index = 0; index < bankCount; index += 1) {
    const bankSlots = slots.slice(index * bankSize, (index + 1) * bankSize)
    if (bankSlots.length === 0) continue

    banks.push({
      id: `bank-${index}`,
      slots: bankSlots,
      side: index === 0 || index === 2 ? 'right' : 'left',
    })
  }

  return banks
}

function getBankWidth(bankCount: number) {
  if (bankCount >= 4) return 'minmax(82px, 0.85fr) minmax(96px, 1fr) minmax(96px, 1fr) minmax(82px, 0.85fr)'
  if (bankCount === 3) return 'repeat(3, minmax(96px, 1fr))'
  if (bankCount === 2) return 'repeat(2, minmax(110px, 1fr))'
  return 'minmax(120px, 170px)'
}

function SlotStall({
  slot,
  side,
  onEdit,
  onDelete,
}: {
  slot: ParkingSlot
  side: SlotBank['side']
  onEdit: (slot: ParkingSlot) => void
  onDelete: (slot: ParkingSlot) => void
}) {
  const badgeStatus: BadgeStatus = slot.status === 'empty' ? 'available' : slot.status

  return (
    <div className="group relative h-16">
      <button
        type="button"
        className={`relative flex h-full w-full items-center justify-center border-y-2 border-slate-900/75 bg-transparent text-xs font-bold text-slate-800 transition hover:bg-white/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg dark:border-slate-100/75 dark:text-slate-100 dark:hover:bg-white/10 ${
          side === 'left' ? 'border-l-2 rounded-l-sm' : 'border-r-2 rounded-r-sm'
        }`}
        onClick={() => onEdit(slot)}
        title={`${slot.slotCode} - ${SLOT_STATUS_LABELS[slot.status]}`}
      >
        <span
          className={`absolute top-2 h-2 w-2 rounded-full ${SLOT_TONES[slot.status]} ${
            side === 'left' ? 'right-3' : 'left-3'
          }`}
          aria-hidden="true"
        />
        <span className="rounded bg-slate-100/80 px-2 py-0.5 shadow-sm dark:bg-slate-950/60">{slot.slotCode}</span>
      </button>

      <button
        type="button"
        className={`absolute top-2 hidden h-6 w-6 items-center justify-center rounded-full border border-rose-300 bg-rose-50 text-sm font-bold leading-none text-rose-700 shadow-sm transition hover:bg-rose-100 group-hover:flex focus:flex dark:border-rose-300/40 dark:bg-rose-400/20 dark:text-rose-50 ${
          side === 'left' ? 'right-2' : 'left-2'
        }`}
        onClick={() => onDelete(slot)}
        title={`Xóa ${slot.slotCode}`}
        aria-label={`Xóa ${slot.slotCode}`}
      >
        ×
      </button>

      <span className="sr-only">
        {VEHICLE_TYPE_LABELS[slot.vehicleType]}, {SLOT_STATUS_DETAILS[slot.status]}, {badgeStatus}
      </span>
    </div>
  )
}

function DoorMarker({ type }: { type: 'entry' | 'exit' }) {
  const isEntry = type === 'entry'

  return (
    <div
      className={`absolute z-10 flex items-center gap-2 rounded border border-slate-800/70 bg-white/90 px-2.5 py-1.5 text-[11px] font-bold text-slate-900 shadow-sm dark:border-slate-100/60 dark:bg-slate-950/90 dark:text-slate-50 ${
        isEntry ? 'bottom-3 left-1/2 -translate-x-1/2' : 'left-1/2 top-3 -translate-x-1/2'
      }`}
    >
      <svg className="h-7 w-10 shrink-0" viewBox="0 0 80 56" aria-hidden="true">
        <path d="M8 48h18" stroke="currentColor" strokeWidth="7" strokeLinecap="square" />
        <path d="M17 48V18" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
        <circle cx="17" cy="17" r="5" fill="white" stroke="currentColor" strokeWidth="5" />
        <path d="M30 22h40" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
        <path d="M36 28l10-12M50 28l10-12M64 28l10-12" stroke="white" strokeWidth="5" />
        <path d="M38 42h32v-9H38z" fill="currentColor" />
        <path d="M44 33h19l-4-8H48z" fill="none" stroke="currentColor" strokeWidth="6" strokeLinejoin="round" />
        <rect x="42" y="35" width="8" height="4" rx="1" fill="white" />
        <rect x="58" y="35" width="8" height="4" rx="1" fill="white" />
        <path d="M43 42v7M65 42v7" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
      </svg>
      {isEntry ? 'Cửa vào' : 'Cửa ra'}
    </div>
  )
}

export function ManagerSlotGridSection({
  buildingName,
  floorNumber,
  slots,
  onEdit,
  onDelete,
}: ManagerSlotGridSectionProps) {
  const banks = splitSlotsIntoBanks(slots)

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

      <div className="mt-4 flex flex-wrap gap-2 text-[11px] text-muted">
        {(Object.keys(SLOT_STATUS_LABELS) as ParkingSlot['status'][]).map((status) => (
          <ManagerStatusBadge
            key={status}
            status={status === 'empty' ? 'available' : status}
            label={SLOT_STATUS_LABELS[status]}
          />
        ))}
      </div>

      <div className="mt-5 overflow-x-auto rounded-lg border border-theme bg-slate-100/80 p-4 dark:bg-slate-950/30">
        <div className="relative min-w-[640px]">
          <DoorMarker type="entry" />
          <DoorMarker type="exit" />
          <div className="absolute left-[26%] top-6 h-[calc(100%-3rem)] border-l-2 border-dashed border-slate-500/60" />
          <div className="absolute right-[26%] top-6 h-[calc(100%-3rem)] border-l-2 border-dashed border-slate-500/60" />
          <div className="absolute left-[29%] top-1/2 h-24 w-16 -translate-y-1/2 rounded-l-full border-y-2 border-l-2 border-dashed border-slate-500/60" />
          <div className="absolute right-[29%] top-[42%] h-24 w-16 rounded-r-full border-y-2 border-r-2 border-dashed border-slate-500/60" />

          <div className="grid items-start gap-5 px-2 pt-9" style={{ gridTemplateColumns: getBankWidth(banks.length) }}>
            {banks.map((bank) => (
              <div key={bank.id} className="relative">
                <div
                  className={`absolute top-0 h-full w-px bg-slate-900/80 dark:bg-slate-100/80 ${
                    bank.side === 'left' ? 'left-0' : 'right-0'
                  }`}
                />
                <div className="grid gap-0">
                  {bank.slots.map((slot) => (
                    <SlotStall key={slot._id} slot={slot} side={bank.side} onEdit={onEdit} onDelete={onDelete} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-center gap-3 text-xs font-medium text-slate-600 dark:text-slate-300">
            <span className="h-px w-12 border-t-2 border-dashed border-slate-500/70" />
            <span>Làn xe và hướng di chuyển</span>
            <span className="text-lg leading-none">↑</span>
          </div>
        </div>
      </div>
    </div>
  )
}
