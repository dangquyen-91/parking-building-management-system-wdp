type StaffGateSummaryProps = {
  activeCount: number
  completedCount: number
  availableCount: number
}

export function StaffGateSummary({
  activeCount,
  completedCount,
  availableCount,
}: StaffGateSummaryProps) {
  const stats = [
    { label: 'Trong bãi', value: activeCount, tone: 'from-sky-500/20', dot: 'bg-sky-500', hint: 'xe' },
    { label: 'Đã ra ca này', value: completedCount, tone: 'from-emerald-500/20', dot: 'bg-emerald-500', hint: 'xe' },
    { label: 'Còn trống', value: availableCount, tone: 'from-amber-500/20', dot: 'bg-amber-500', hint: 'chỗ' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[38rem]">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className={`relative overflow-hidden rounded-2xl border border-theme bg-gradient-to-br ${stat.tone} via-badge to-badge p-4 shadow-sm`}
        >
          <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.14em] text-subtle">
            <span className={`size-2 rounded-full ${stat.dot}`} />
            {stat.label}
          </div>
          <p className="mt-2 text-3xl font-black tracking-tight text-fg">
            {stat.value}
            <span className="ml-1 text-xs font-semibold text-muted">{stat.hint}</span>
          </p>
        </div>
      ))}
    </div>
  )
}
