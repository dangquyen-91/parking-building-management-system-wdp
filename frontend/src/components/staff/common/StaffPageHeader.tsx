import type { ReactNode } from 'react'
import { cn } from '../../../lib/utils'
import { Badge } from '../../ui/badge'
import { Card, CardContent } from '../../ui/card'

type StaffPageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  icon?: ReactNode
  tone?: 'sky' | 'emerald'
}

const toneClasses = {
  sky: 'border-sky-500/20 from-sky-100 via-background to-cyan-100/70 dark:from-sky-950/60 dark:via-background dark:to-cyan-950/30',
  emerald: 'border-emerald-500/20 from-emerald-100 via-background to-teal-100/70 dark:from-emerald-950/60 dark:via-background dark:to-teal-950/30',
}

export function StaffPageHeader({
  eyebrow,
  title,
  description,
  actions,
  icon,
  tone = 'sky',
}: StaffPageHeaderProps) {
  return (
    <Card className={cn('relative mb-6 overflow-hidden bg-linear-to-br shadow-sm', toneClasses[tone])}>
      <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-white/35 blur-3xl dark:bg-white/5" />
      <CardContent className="relative p-5 md:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="flex items-start gap-4">
            {icon && (
              <span className={cn(
                'hidden size-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg sm:flex',
                tone === 'sky' ? 'bg-sky-600 shadow-sky-500/20' : 'bg-emerald-600 shadow-emerald-500/20',
              )}>
                {icon}
              </span>
            )}
            <div>
              <Badge className={cn(
                'mb-3 border-0 text-white shadow-sm',
                tone === 'sky' ? 'bg-sky-600 shadow-sky-500/20' : 'bg-emerald-600 shadow-emerald-500/20',
              )}>
                {eyebrow}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl dark:text-white">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
          </div>
          {actions}
        </div>
      </CardContent>
    </Card>
  )
}
