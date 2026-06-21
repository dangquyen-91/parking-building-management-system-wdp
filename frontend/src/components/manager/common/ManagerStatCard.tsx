type ManagerStatCardProps = {
  label: string
  value: string | number
  detail: string
  tone?: 'sky' | 'emerald' | 'violet' | 'amber'
}

const toneClass = {
  sky: {
    glow: 'from-sky-500/18',
    bar: 'bg-sky-500',
    text: 'text-sky-600 dark:text-sky-300',
  },
  emerald: {
    glow: 'from-emerald-500/18',
    bar: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-300',
  },
  violet: {
    glow: 'from-violet-500/18',
    bar: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-300',
  },
  amber: {
    glow: 'from-amber-500/18',
    bar: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-300',
  },
}

export function ManagerStatCard({ label, value, detail, tone = 'sky' }: ManagerStatCardProps) {
  const toneStyles = toneClass[tone]

  return (
    <div
      className={`group relative min-h-36 overflow-hidden rounded-2xl border border-theme bg-gradient-to-br ${toneStyles.glow} via-badge to-badge p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${toneStyles.bar}`} />
      <div className={`absolute right-4 top-4 size-11 rounded-full border border-current/15 bg-current/5 ${toneStyles.text}`} />
      <p className="relative text-[11px] font-black uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className="relative mt-4 truncate text-3xl font-black tracking-tight text-fg">{value}</p>
      <p className="relative mt-2 line-clamp-2 text-xs leading-5 text-muted">{detail}</p>
    </div>
  )
}
