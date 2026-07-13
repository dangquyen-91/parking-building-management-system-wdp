import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '../../ui/card'

type IncidentStats = {
  open: number
  inProgress: number
  resolved: number
}

const STAT_ITEMS = [
  {
    key: 'open',
    label: 'Mới gửi',
    detail: 'Cần kiểm tra ngay',
    icon: AlertCircle,
    className: 'border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-300',
  },
  {
    key: 'inProgress',
    label: 'Đang xử lý',
    detail: 'Đang liên hệ chủ xe',
    icon: Clock,
    className: 'border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  },
  {
    key: 'resolved',
    label: 'Đã xử lý',
    detail: 'Đã đóng khiếu nại',
    icon: CheckCircle2,
    className: 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  },
] as const

export function StaffIncidentStats({ stats }: { stats: IncidentStats }) {
  return (
    <section className="mb-5 grid gap-3 md:grid-cols-3">
      {STAT_ITEMS.map((item) => {
        const Icon = item.icon

        return (
          <Card key={item.key} className={item.className}>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div>
                <CardDescription className="text-current/75">{item.label}</CardDescription>
                <CardTitle className="mt-2 text-4xl tabular-nums">{stats[item.key]}</CardTitle>
                <p className="mt-1 text-sm text-current/70">{item.detail}</p>
              </div>
              <span className="grid size-12 place-items-center rounded-lg bg-white/70 text-current shadow-sm dark:bg-white/10">
                <Icon className="size-5" />
              </span>
            </CardHeader>
          </Card>
        )
      })}
    </section>
  )
}
