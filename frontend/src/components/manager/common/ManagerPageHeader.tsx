import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

type ManagerPageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}

export function ManagerPageHeader({
  eyebrow,
  title,
  description,
  actions,
}: ManagerPageHeaderProps) {
  return (
    <Card className="mb-6 overflow-hidden border-emerald-500/20 bg-gradient-to-br from-white via-sky-50/70 to-emerald-50/70 shadow-sm dark:from-slate-950 dark:via-sky-950/25 dark:to-emerald-950/20">
      <CardContent className="p-5 md:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="min-w-0">
            <Badge className="mb-3 gap-2 border-0 bg-emerald-600 text-[10px] font-semibold uppercase tracking-[0.16em] text-white">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {eyebrow}
            </Badge>
            <h1 className="max-w-4xl break-words text-3xl font-semibold tracking-tight text-slate-950 md:text-4xl dark:text-white">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
          </div>
          {actions && <div className="min-w-0 w-full xl:w-auto xl:max-w-[48rem] xl:shrink-0">{actions}</div>}
        </div>
      </CardContent>
    </Card>
  )
}


