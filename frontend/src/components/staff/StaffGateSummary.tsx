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
    { label: 'Dang gui', value: activeCount },
    { label: 'Da checkout', value: completedCount },
    { label: 'Cho trong', value: availableCount },
  ]

  return (
    <div className="grid gap-2 text-center sm:grid-cols-3 lg:min-w-[26rem]">
      {stats.map((stat) => (
        <div key={stat.label} className="rounded-lg border border-theme bg-badge px-3 py-3">
          <p className="text-2xl font-semibold text-fg">{stat.value}</p>
          <p className="mt-1 text-[11px] text-subtle">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}

