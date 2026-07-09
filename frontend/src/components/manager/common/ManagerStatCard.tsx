import { Activity, Check, Clock, DollarSign } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ManagerStatCardProps = {
  label: string
  value: string | number
  detail: string
  tone?: 'sky' | 'emerald' | 'violet' | 'amber'
}

const toneClass = {
  sky: {
    bar: 'bg-sky-500',
    text: 'text-sky-600 dark:text-sky-300',
    iconBg: 'bg-sky-500/10',
  },
  emerald: {
    bar: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-300',
    iconBg: 'bg-emerald-500/10',
  },
  violet: {
    bar: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-300',
    iconBg: 'bg-violet-500/10',
  },
  amber: {
    bar: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-300',
    iconBg: 'bg-amber-500/10',
  },
}

function ManagerStatIcon({ tone }: { tone: ManagerStatCardProps['tone'] }) {
  if (tone === 'emerald') {
    return <Check aria-hidden="true" />
  }

  if (tone === 'violet') {
    return <DollarSign aria-hidden="true" />
  }

  if (tone === 'amber') {
    return <Clock aria-hidden="true" />
  }

  return <Activity aria-hidden="true" />
}

export function ManagerStatCard({ label, value, detail, tone = 'sky' }: ManagerStatCardProps) {
  const toneStyles = toneClass[tone]

  return (
    <Card className="relative min-h-36 shadow-sm transition-shadow hover:shadow-md">
      <span className={`absolute inset-y-0 left-0 w-1 ${toneStyles.bar}`} />
      <CardContent className="p-5">
        <div className={cn('absolute right-4 top-4 flex size-10 items-center justify-center rounded-lg border', toneStyles.iconBg, toneStyles.text)}>
          <ManagerStatIcon tone={tone} />
        </div>
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
        <p className="mt-4 truncate text-3xl font-semibold tracking-tight text-foreground">{value}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}


