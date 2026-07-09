import { Card, CardDescription, CardHeader, CardTitle } from '../../ui/card'

type StaffVehicleStatsProps = {
  stats: Array<{ label: string; value: number }>
  isLoading: boolean
}

const STAT_COLORS = [
  'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  'border-indigo-500/25 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300',
  'border-cyan-500/25 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300',
  'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
] as const

export function StaffVehicleStats({ stats, isLoading }: StaffVehicleStatsProps) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, index) => (
        <Card key={stat.label} size="sm" className={STAT_COLORS[index % STAT_COLORS.length]}>
          <CardHeader>
            <CardDescription className="text-current/75">{stat.label}</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? '-' : stat.value}
              <span className="ml-1 text-xs font-medium text-current/65">xe</span>
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
