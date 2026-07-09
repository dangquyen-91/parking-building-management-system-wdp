import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Card, CardDescription, CardHeader, CardTitle } from '../../ui/card'

type IncidentStats = {
  open: number
  inProgress: number
  resolved: number
}

const STAT_ITEMS = [
  { key: 'open', label: 'Mới gửi', detail: 'Cần kiểm tra ngay', icon: AlertCircle },
  { key: 'inProgress', label: 'Đang xử lý', detail: 'Đang liên hệ chủ xe', icon: Clock },
  { key: 'resolved', label: 'Đã xử lý', detail: 'Đã đóng khiếu nại', icon: CheckCircle2 },
] as const

export function StaffIncidentStats({ stats }: { stats: IncidentStats }) {
  return (
    <section className="mb-5 grid gap-3 md:grid-cols-3">
      {STAT_ITEMS.map((item) => {
        const Icon = item.icon

        return (
          <Card key={item.key}>
            <CardHeader className="flex-row items-center justify-between gap-4">
              <div>
                <CardDescription>{item.label}</CardDescription>
                <CardTitle className="mt-2 text-4xl tabular-nums">{stats[item.key]}</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
              </div>
              <span className="grid size-12 place-items-center rounded-lg bg-muted text-muted-foreground">
                <Icon className="size-5" />
              </span>
            </CardHeader>
          </Card>
        )
      })}
    </section>
  )
}
