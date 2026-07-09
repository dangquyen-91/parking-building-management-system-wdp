import { Card, CardDescription, CardHeader, CardTitle } from '../../ui/card'

type StaffVehicleStatsProps = {
  stats: Array<{ label: string; value: number }>
  isLoading: boolean
}

export function StaffVehicleStats({ stats, isLoading }: StaffVehicleStatsProps) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-3xl">
              {isLoading ? '-' : stat.value}
              <span className="ml-1 text-xs font-medium text-muted-foreground">xe</span>
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
