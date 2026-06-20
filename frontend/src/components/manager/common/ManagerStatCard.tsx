type ManagerStatCardProps = {
  label: string
  value: string | number
  detail: string
  tone?: 'sky' | 'emerald' | 'violet' | 'amber'
}

const toneClass = {
  sky: 'from-sky-500/18 text-sky-600 dark:text-sky-300',
  emerald: 'from-emerald-500/18 text-emerald-600 dark:text-emerald-300',
  violet: 'from-violet-500/18 text-violet-600 dark:text-violet-300',
  amber: 'from-amber-500/18 text-amber-600 dark:text-amber-300',
}

export function ManagerStatCard({ label, value, detail, tone = 'sky' }: ManagerStatCardProps) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border border-theme bg-gradient-to-br ${toneClass[tone]} to-badge p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5`}>
      <div className="absolute right-4 top-4 h-10 w-10 rounded-full border border-current/15 bg-current/5" />
      <p className="relative text-[11px] font-bold uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className="relative mt-4 text-3xl font-black tracking-tight text-fg">{value}</p>
      <p className="relative mt-1 text-xs leading-5 text-muted">{detail}</p>
    </div>
  )
}

