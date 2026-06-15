type StaffVehicleStatsProps = {
  stats: Array<{ label: string; value: number }>
  isLoading: boolean
}

export function StaffVehicleStats({ stats, isLoading }: StaffVehicleStatsProps) {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <div key={stat.label} className="liquid-glass-card rounded-lg p-4">
          <p className="text-2xl font-semibold text-fg">{isLoading ? '-' : stat.value}</p>
          <p className="mt-1 text-xs text-subtle">{stat.label}</p>
        </div>
      ))}
    </div>
  )
}
