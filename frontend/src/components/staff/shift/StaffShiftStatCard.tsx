import type { ShiftStat } from './staffShiftUtils'

export function StaffShiftStatCard({ stat }: { stat: ShiftStat }) {
  const toneClass = {
    sky: 'from-sky-500/15 text-sky-700 dark:text-sky-200',
    emerald: 'from-emerald-500/15 text-emerald-700 dark:text-emerald-200',
    amber: 'from-amber-500/15 text-amber-700 dark:text-amber-200',
    violet: 'from-violet-500/15 text-violet-700 dark:text-violet-200',
  }[stat.tone]

  return (
    <article className="rounded-2xl border border-theme bg-badge p-4 shadow-sm">
      <div className={`mb-3 h-1.5 w-16 rounded-full bg-gradient-to-r ${toneClass} to-transparent`} />
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-subtle">{stat.label}</p>
      <p className="mt-3 text-2xl font-black text-fg">{stat.value}</p>
      <p className="mt-1 text-xs text-muted">{stat.detail}</p>
    </article>
  )
}
