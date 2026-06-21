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
    { label: 'Đang trong bãi', value: activeCount, tone: 'bg-sky-500', hint: 'xe' },
    { label: 'Đã trả trong ca', value: completedCount, tone: 'bg-emerald-500', hint: 'xe' },
    { label: 'Vị trí còn trống', value: availableCount, tone: 'bg-amber-500', hint: 'chỗ' },
  ]

  return (
    <div className="grid gap-2 sm:grid-cols-3 xl:min-w-[34rem]">
      {stats.map((stat) => (
        <div key={stat.label} className="relative overflow-hidden rounded-xl border border-theme bg-badge px-4 py-3">
          <span className={`absolute inset-y-0 left-0 w-1 ${stat.tone}`} />
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-subtle">{stat.label}</p>
          <p className="mt-1 text-2xl font-bold tracking-tight text-fg">
            {stat.value} <span className="text-xs font-medium text-muted">{stat.hint}</span>
          </p>
        </div>
      ))}
    </div>
  )
}

