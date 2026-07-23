import { CarFront, CircleParking, LogOut } from 'lucide-react'
import { Card, CardContent } from '../../ui/card'

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
      icon: CarFront,
      className: 'border-sky-500/25 bg-sky-500/10 text-sky-700 dark:text-sky-300',
    },
    {
      label: 'Đã ra ca này',
      value: completedCount,
      hint: 'xe',
      icon: LogOut,
      className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
    },
    {
      label: 'Còn trống',
      value: availableCount,
      hint: 'chỗ',
      icon: CircleParking,
      className: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
    },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[38rem]">
      {stats.map((stat) => (
        <Card key={stat.label} size="sm" className={`${stat.className} shadow-sm`}>
          <CardContent className="flex items-center justify-between gap-3 p-3.5">
            <div>
              <p className="text-xs font-medium text-current/70">{stat.label}</p>
              <p className="mt-1 text-2xl font-bold">
                {stat.value}
                <span className="ml-1 text-[11px] font-medium text-current/60">{stat.hint}</span>
              </p>
            </div>
            <span className="flex size-9 items-center justify-center rounded-xl bg-background/70 shadow-sm">
              <stat.icon className="size-4" />
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
