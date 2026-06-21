import { useId, useState } from 'react'
import type { ManagerBuildingSummary } from '../../../hooks/useManagerBuildings'

export function AdminBuildingCard({ building, onEdit, onEditFloor }: { building: ManagerBuildingSummary; onEdit: (building: ManagerBuildingSummary) => void; onEditFloor: (floor: ManagerBuildingSummary['floors'][number]) => void }) {
  const [open, setOpen] = useState(false)
  const id = useId()

  return (
    <article className="liquid-glass-card group rounded-2xl border border-sky-500/10 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-sky-500/25 hover:shadow-xl">
      <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-cyan-400 to-emerald-400" />
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-sky-600 dark:text-sky-300">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M4 20V5.5A1.5 1.5 0 0 1 5.5 4H14l4 4v12H4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M8 9h2M8 13h2M8 17h2M14 13h2M14 17h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </span>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-black text-fg">{building.name}</h2>
              <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wide ${building.isActive ? 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200' : 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-200'}`}>
                {building.isActive ? 'Hoạt động' : 'Tạm dừng'}
              </span>
            </div>
            <p className="mt-1 text-xs text-subtle">{building.address}</p>
            {building.description && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{building.description}</p>}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:flex-nowrap">
          <Metric label="Tầng" value={building.floorCount} tone="sky" />
          <Metric label="Chỗ đỗ" value={building.totalSlots} tone="emerald" />
          <button className="h-11 rounded-xl border border-violet-500/25 bg-violet-500/10 px-4 text-sm font-bold text-violet-700 transition hover:bg-violet-500 hover:text-white dark:text-violet-200" onClick={() => onEdit(building)}>Chỉnh sửa</button>
        </div>
      </div>

      <button type="button" className="mt-5 flex w-full items-center justify-between rounded-xl border border-theme bg-page/45 px-4 py-3 text-sm font-bold text-fg transition-colors hover:border-sky-500/25 hover:bg-sky-500/5" aria-expanded={open} aria-controls={id} onClick={() => setOpen((value) => !value)}>
        <span>{open ? 'Ẩn danh sách tầng' : 'Xem danh sách tầng'}</span>
        <span className="flex items-center gap-2 text-xs text-subtle">{building.floors.length} tầng <span className={`transition-transform ${open ? 'rotate-180' : ''}`}>⌄</span></span>
      </button>

      {open && (
        <div id={id} className="mt-3 grid gap-2 md:grid-cols-2">
          {building.floors.length ? building.floors.map((floor) => (
            <div key={floor.id} className="flex items-center justify-between gap-3 rounded-2xl border border-theme bg-page/40 p-3 transition-colors hover:border-sky-500/20 hover:bg-sky-500/5">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-xs font-black ${floor.vehicleType === 'car' ? 'bg-violet-500/15 text-violet-700 dark:text-violet-200' : 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200'}`}>{floor.floorNumber}</span>
                <div className="min-w-0">
                  <p className="font-bold text-fg">Tầng {floor.floorNumber}</p>
                  <p className="mt-1 truncate text-xs text-subtle">{floor.floorType === 'resident' ? 'Cư dân' : 'Khách'} · {floor.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'} · {floor.totalSlots} chỗ</p>
                </div>
              </div>
              <button className="h-9 shrink-0 rounded-xl border border-theme px-3 text-xs font-bold text-fg transition hover:bg-ghost" onClick={() => onEditFloor(floor)}>Sửa</button>
            </div>
          )) : <p className="rounded-2xl border border-dashed border-theme p-4 text-sm text-muted">Chưa có tầng.</p>}
        </div>
      )}
    </article>
  )
}

function Metric({ label, value, tone }: { label: string; value: number; tone: 'sky' | 'emerald' }) {
  return <div className={`min-w-20 rounded-xl border p-2.5 text-center ${tone === 'sky' ? 'border-sky-500/15 bg-sky-500/10' : 'border-emerald-500/15 bg-emerald-500/10'}`}><p className="text-[10px] font-bold uppercase tracking-wide text-subtle">{label}</p><p className="mt-1 text-lg font-black text-fg">{value}</p></div>
}
