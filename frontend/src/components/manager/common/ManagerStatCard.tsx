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

function ManagerStatIcon({ tone }: { tone: ManagerStatCardProps['tone'] }) {
  if (tone === 'emerald') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12.5l4 4L19 6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (tone === 'violet') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3v18M5 8h9.5a3.5 3.5 0 0 1 0 7H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    )
  }

  if (tone === 'amber') {
    return (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 4v8l5 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    )
  }

  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 17l4-4 3 3 7-8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M15 8h4v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ManagerStatCard({ label, value, detail, tone = 'sky' }: ManagerStatCardProps) {
  const toneStyles = toneClass[tone]

  return (
    <div
      className={`group relative min-h-36 overflow-hidden rounded-2xl border border-theme bg-gradient-to-br ${toneStyles.glow} via-badge to-badge p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/5`}
    >
      <span className={`absolute inset-y-0 left-0 w-1 ${toneStyles.bar}`} />
      <div className={`absolute right-4 top-4 flex size-11 items-center justify-center rounded-2xl border border-current/20 bg-current/10 shadow-sm ${toneStyles.text}`}>
        <ManagerStatIcon tone={tone} />
      </div>
      <p className="relative text-[11px] font-black uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className="relative mt-4 truncate text-3xl font-black tracking-tight text-fg">{value}</p>
      <p className="relative mt-2 line-clamp-2 text-xs leading-5 text-muted">{detail}</p>
    </div>
  )
}
