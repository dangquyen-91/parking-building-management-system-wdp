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
    glow: 'from-sky-500/18',
  },
  emerald: {
    bar: 'bg-emerald-500',
    text: 'text-emerald-600 dark:text-emerald-300',
    iconBg: 'bg-emerald-500/10',
    glow: 'from-emerald-500/18',
  },
  violet: {
    bar: 'bg-violet-500',
    text: 'text-violet-600 dark:text-violet-300',
    iconBg: 'bg-violet-500/10',
    glow: 'from-violet-500/18',
  },
  amber: {
    bar: 'bg-amber-500',
    text: 'text-amber-600 dark:text-amber-300',
    iconBg: 'bg-amber-500/10',
    glow: 'from-amber-500/18',
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
    <Card className={`relative min-h-36 overflow-hidden border-current/15 bg-gradient-to-br ${toneStyles.glow} via-card to-card shadow-sm transition-shadow hover:shadow-md`}>
      <span className={`absolute inset-y-0 left-0 w-1 ${toneStyles.bar}`} />
      <CardContent className="p-5">
        <div className={cn('absolute right-4 top-4 flex size-10 items-center justify-center rounded-lg border', toneStyles.iconBg, toneStyles.text)}>
          <ManagerStatIcon tone={tone} />
        </div>
        <p className="min-w-0 pr-12 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
        <p className="mt-4 break-words pr-10 text-2xl font-semibold tracking-tight leading-tight text-foreground md:text-3xl">{value}</p>
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{detail}</p>
      </CardContent>
    </Card>
  )
}


