import type { ParkingSlot, SlotStatus } from '../../../services/managerParkingSlotApi'

const STATUS_META: Record<SlotStatus, { label: string; dot: string; border: string; surface: string }> = {
  empty: {
    label: 'Còn trống',
    dot: 'bg-emerald-500',
    border: 'border-emerald-500/45',
    surface: 'from-emerald-500/10 to-transparent',
  },
  occupied: {
    label: 'Đã có xe',
    dot: 'bg-rose-500',
    border: 'border-rose-500/45',
    surface: 'from-rose-500/10 to-transparent',
  },
  reserved: {
    label: 'Đã đặt trước',
    dot: 'bg-amber-400',
    border: 'border-amber-400/55',
    surface: 'from-amber-400/15 to-transparent',
  },
  maintenance: {
    label: 'Bảo trì',
    dot: 'bg-slate-400',
    border: 'border-slate-400/55',
    surface: 'from-slate-400/15 to-transparent',
  },
}

type AdminParkingSlotDiagramProps = {
  slots: ParkingSlot[]
  onEdit: (slot: ParkingSlot) => void
  onDelete: (slot: ParkingSlot) => void
}

export function AdminParkingSlotDiagram({ slots, onEdit, onDelete }: AdminParkingSlotDiagramProps) {
  const leftSlots = slots.filter((_, index) => index % 2 === 0)
  const rightSlots = slots.filter((_, index) => index % 2 === 1)

  return (
    <div>
      <div className="overflow-x-auto pb-2">
        <div className="mx-auto grid w-fit min-w-[30rem] grid-cols-[8.5rem_7rem_8.5rem] gap-2.5 rounded-[1.5rem] border-[3px] border-slate-600/70 bg-slate-200/55 p-3 shadow-inner dark:border-slate-500/60 dark:bg-slate-900/55">
          <SlotColumn slots={leftSlots} onEdit={onEdit} onDelete={onDelete} />

          <div className="relative flex min-h-full flex-col items-center justify-between overflow-hidden border-x-2 border-dashed border-slate-400/80 bg-page/55 px-2 py-4">
            <span className="absolute inset-y-0 left-1/2 w-px border-l border-dashed border-amber-400/70" />
            <div className="relative z-10 rounded-xl border border-dashed border-emerald-600/60 bg-emerald-500/10 px-2 py-3 text-center">
              <p className="text-[10px] font-black uppercase tracking-[0.15em] text-emerald-700 dark:text-emerald-300">
                Khu vực
              </p>
              <p className="mt-1 text-[10px] font-bold leading-4 text-fg">
                Transfer
                <br />
                thiết bị
                <br />
                nâng / chuyển
              </p>
            </div>

            <div className="relative z-10 my-5 rounded-xl bg-page/90 px-2 py-3 text-center shadow-sm">
              <div className="text-3xl font-light leading-none text-violet-600 dark:text-violet-300">↕</div>
              <p className="mt-2 text-[10px] font-black uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">
                Lối ra / vào
              </p>
            </div>

            <div className="relative z-10 flex flex-col items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-subtle">
              <span>{slots.length} ô đỗ</span>
              <span>Luồng xe trung tâm</span>
            </div>
          </div>

          <SlotColumn slots={rightSlots} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 rounded-2xl border border-theme bg-page/55 p-3 text-xs text-muted">
        {(Object.entries(STATUS_META) as Array<[SlotStatus, (typeof STATUS_META)[SlotStatus]]>).map(([status, meta]) => (
          <div key={status} className="flex items-center gap-2">
            <span className={`size-2.5 rounded-full ${meta.dot}`} />
            {meta.label} ({slots.filter((slot) => slot.status === status).length})
          </div>
        ))}
      </div>
    </div>
  )
}

function SlotColumn({ slots, onEdit, onDelete }: AdminParkingSlotDiagramProps) {
  return (
    <div className="flex flex-col gap-2">
      {slots.map((slot) => (
        <SlotCard key={slot._id} slot={slot} onEdit={onEdit} onDelete={onDelete} />
      ))}
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
    <article
      className={`group relative h-[5.25rem] w-[8.5rem] overflow-hidden rounded-xl border-2 bg-gradient-to-br ${meta.border} ${meta.surface} bg-page p-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md`}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="rounded-md bg-amber-200 px-1.5 py-0.5 text-[9px] font-black tracking-wide text-slate-900 shadow-sm">
          {slot.slotCode}
        </span>
        <span className={`mt-0.5 size-2.5 rounded-full shadow-[0_0_0_3px_rgba(255,255,255,0.55)] ${meta.dot}`} title={meta.label} />
      </div>

      <div className="-mt-2 flex items-center justify-center text-slate-600 dark:text-slate-300">
        <CarIcon occupied={slot.status === 'occupied'} />
      </div>

      <div className="-mt-1 flex items-center justify-between gap-1">
        <span className="max-w-[3.8rem] truncate text-[8px] font-bold uppercase tracking-wide text-subtle">{meta.label}</span>
        <div className="flex gap-0.5 opacity-80 transition group-hover:opacity-100">
          <button type="button" className="rounded border border-theme bg-page/80 px-1 py-0.5 text-[8px] font-bold text-fg hover:bg-ghost" onClick={() => onEdit(slot)}>
            Sửa
          </button>
          <button type="button" className="rounded border border-rose-500/25 bg-rose-500/10 px-1 py-0.5 text-[8px] font-bold text-rose-600 hover:bg-rose-500 hover:text-white dark:text-rose-300" onClick={() => onDelete(slot)}>
            Xóa
          </button>
        </div>
      </div>
    </article>
  )
}

function CarIcon({ occupied }: { occupied: boolean }) {
  return (
    <svg
      width="58"
      height="29"
      viewBox="0 0 120 58"
      fill="none"
      aria-hidden="true"
      className={occupied ? 'text-rose-500' : 'text-slate-600 dark:text-slate-300'}
    >
      <path
        d="M12 11C19 5 31 3 60 3s41 2 48 8c5 4 8 14 8 18s-3 14-8 18c-7 6-19 8-48 8s-41-2-48-8C7 43 4 33 4 29s3-14 8-18Z"
        fill="currentColor"
        fillOpacity={occupied ? 0.18 : 0.08}
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M28 8c5-3 13-4 32-4s27 1 32 4l-8 12H36L28 8Zm8 30h48l8 12c-5 3-13 4-32 4s-27-1-32-4l8-12Z"
        fill="currentColor"
        fillOpacity="0.12"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="M36 20h48l5 9-5 9H36l-5-9 5-9Z"
        fill="var(--page-bg)"
        fillOpacity="0.9"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path d="M42 20 38 8M78 20 82 8M42 38l-4 12M78 38l4 12" stroke="currentColor" strokeWidth="1.5" />
      <path d="M15 16h8M15 42h8M97 16h8M97 42h8" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <path d="M8 25h7v8H8M112 25h-7v8h7" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M55 7h10M55 51h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
