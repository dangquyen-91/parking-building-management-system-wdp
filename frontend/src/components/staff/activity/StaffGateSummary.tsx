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
    {
      label: 'Trong bãi',
      value: activeCount,
      hint: 'xe',
      className: 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    },
    {
      label: 'Đã ra ca này',
      value: completedCount,
      hint: 'xe',
      className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    },
    {
      label: 'Còn trống',
      value: availableCount,
      hint: 'chỗ',
      className: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[38rem]">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm" className={stat.className}>
          <CardHeader>
            <CardDescription className="text-current/75">{stat.label}</CardDescription>
            <CardTitle className="text-3xl">
              {stat.value}
              <span className="ml-1 text-xs font-medium text-current/65">{stat.hint}</span>
            </CardTitle>
          </CardHeader>
        </Card>
      ))}
    </div>
  )
}
