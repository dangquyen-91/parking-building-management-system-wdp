import { Card, CardHeader, CardDescription, CardTitle } from '../../ui/card'

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
    { label: 'Trong bãi', value: activeCount, hint: 'xe' },
    { label: 'Đã ra ca này', value: completedCount, hint: 'xe' },
    { label: 'Còn trống', value: availableCount, hint: 'chỗ' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[38rem]">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm">
          <CardHeader>
            <CardDescription>{stat.label}</CardDescription>
            <CardTitle className="text-3xl">
              {stat.value}
              <span className="ml-1 text-xs font-medium text-muted-foreground">{stat.hint}</span>
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
