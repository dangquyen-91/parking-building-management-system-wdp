type StaffVehicleStatsProps = {
  stats: Array<{ label: string; value: number }>
  isLoading: boolean
}

export function StaffVehicleStats({ stats, isLoading }: StaffVehicleStatsProps) {
  const tones = [
    { bar: 'bg-sky-500', glow: 'from-sky-500/15' },
    { bar: 'bg-violet-500', glow: 'from-violet-500/15' },
    { bar: 'bg-amber-500', glow: 'from-amber-500/15' },
    { bar: 'bg-emerald-500', glow: 'from-emerald-500/15' },
  ]

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <div
          key={stat.label}
          className={`relative overflow-hidden rounded-2xl border border-theme bg-gradient-to-br ${tones[index]?.glow ?? tones[0].glow} via-badge to-badge p-4 shadow-sm`}
        >
          <span className={`absolute inset-y-0 left-0 w-1 ${tones[index]?.bar ?? tones[0].bar}`} />
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-subtle">{stat.label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-fg">
            {isLoading ? '-' : stat.value}
            <span className="ml-1 text-xs font-semibold text-muted">xe</span>
          </p>
        </div>
      ))}
    </div>
  )
}
