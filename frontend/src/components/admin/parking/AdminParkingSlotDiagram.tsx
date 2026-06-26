import type { ParkingSlot, SlotStatus } from '../../../services/managerParkingSlotApi'

const STATUS_META: Record<SlotStatus, { label: string; dot: string; border: string; surface: string; text: string }> = {
  empty: {
    label: 'Còn trống',
    dot: 'bg-emerald-500',
    border: 'border-emerald-500/35',
    surface: 'bg-emerald-500/10',
    text: 'text-emerald-700 dark:text-emerald-300',
  },
  occupied: {
    label: 'Đã có xe',
    dot: 'bg-rose-500',
    border: 'border-rose-500/35',
    surface: 'bg-rose-500/10',
    text: 'text-rose-700 dark:text-rose-300',
  },
  reserved: {
    label: 'Đã đặt trước',
    dot: 'bg-amber-400',
    border: 'border-amber-400/45',
    surface: 'bg-amber-400/10',
    text: 'text-amber-700 dark:text-amber-300',
  },
  maintenance: {
    label: 'Bảo trì',
    dot: 'bg-slate-400',
    border: 'border-slate-400/45',
    surface: 'bg-slate-400/10',
    text: 'text-slate-600 dark:text-slate-300',
  },
}

type AdminParkingSlotDiagramProps = {
  slots: ParkingSlot[]
  onEdit: (slot: ParkingSlot) => void
  onDelete: (slot: ParkingSlot) => void
}

export function AdminParkingSlotDiagram({ slots, onEdit, onDelete }: AdminParkingSlotDiagramProps) {
  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-[repeat(auto-fill,minmax(8rem,1fr))] gap-2.5">
        {slots.map((slot) => (
          <SlotCard key={slot._id} slot={slot} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-theme bg-page/55 p-3 text-xs text-muted">
        {(Object.entries(STATUS_META) as Array<[SlotStatus, (typeof STATUS_META)[SlotStatus]]>).map(([status, meta]) => (
          <div key={status} className="flex items-center gap-2 rounded-full border border-theme bg-badge px-3 py-1">
            <span className={`size-2.5 rounded-full ${meta.dot}`} />
            {meta.label} ({slots.filter((slot) => slot.status === status).length})
          </div>
        ))}
      </div>
    </div>
  )
}

function SlotCard({
  slot,
  onEdit,
  onDelete,
}: {
  slot: ParkingSlot
  onEdit: (slot: ParkingSlot) => void
  onDelete: (slot: ParkingSlot) => void
}) {
  const meta = STATUS_META[slot.status]

  return (
    <article className={`group min-h-[6rem] rounded-xl border ${meta.border} ${meta.surface} p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-black text-fg">{slot.slotCode}</p>
          <p className={`mt-1 text-[11px] font-bold ${meta.text}`}>{meta.label}</p>
        </div>
        <span className={`mt-1 size-3 rounded-full shadow-[0_0_0_3px_rgba(255,255,255,0.55)] ${meta.dot}`} title={meta.label} />
      </div>

      <div className="mt-4 flex items-center gap-1.5">
        <button
          type="button"
          className="flex-1 rounded-lg border border-theme bg-page/80 px-2 py-1 text-xs font-bold text-fg hover:bg-ghost"
          onClick={() => onEdit(slot)}
        >
          Sửa
        </button>
        <button
          type="button"
          className="flex-1 rounded-lg border border-rose-500/25 bg-rose-500/10 px-2 py-1 text-xs font-bold text-rose-600 hover:bg-rose-500 hover:text-white dark:text-rose-300"
          onClick={() => onDelete(slot)}
        >
          Xóa
        </button>
      </div>
    </article>
  )
}
