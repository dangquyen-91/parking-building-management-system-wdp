type AdminStatCardProps = {
  label: string
  value: string | number
  detail: string
  tone?: 'violet' | 'sky' | 'emerald' | 'amber'
}

const toneClass = {
  violet: {
    glow: 'from-violet-500/18',
    bar: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-300',
    soft: 'bg-violet-500/10',
  },
  sky: {
    glow: 'from-sky-500/18',
    bar: 'bg-sky-500',
    text: 'text-sky-600 dark:text-sky-300',
    soft: 'bg-sky-500/10',
  },
  emerald: {
    glow: 'from-emerald-500/18',
    bar: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-300',
    soft: 'bg-emerald-500/10',
  },
  amber: {
    glow: 'from-amber-500/18',
    bar: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-300',
    soft: 'bg-amber-500/10',
  },
}

const toneIcon = { violet: Users, sky: ParkingCircle, emerald: Activity, amber: CircleDollarSign }

export function AdminStatCard({ label, value, detail, tone = 'violet' }: AdminStatCardProps) {
  const toneStyles = toneClass[tone]
  const Icon = toneIcon[tone]

  return (
    <Card className="group relative min-h-36 overflow-hidden transition-all hover:-translate-y-0.5 hover:shadow-md">
      <span className={`absolute inset-y-0 left-0 w-1 ${toneStyles.bar}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <span className={`flex size-9 items-center justify-center rounded-lg ${toneStyles.soft} ${toneStyles.text}`}><Icon className="size-4" /></span>
        </div>
        <p className="mt-3 truncate text-2xl font-bold tracking-tight">{value}</p>
        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}
import { Activity, CircleDollarSign, ParkingCircle, Users } from 'lucide-react'
import { Card, CardContent } from '../../ui/card'
