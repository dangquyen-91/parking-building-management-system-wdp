import type { ReactNode } from 'react'
import { Badge } from '../../ui/badge'
import { Card, CardContent } from '../../ui/card'

type StaffPageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}

export function StaffPageHeader({ eyebrow, title, description, actions }: StaffPageHeaderProps) {
  return (
    <Card className="mb-6 overflow-hidden border-sky-500/20 bg-gradient-to-br from-white via-sky-50/80 to-emerald-50/80 shadow-sm dark:from-slate-950 dark:via-sky-950/30 dark:to-emerald-950/20">
      <CardContent className="p-5 md:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge className="mb-3 border-0 bg-sky-600 text-white shadow-sm shadow-sky-500/20">
              {eyebrow}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight text-slate-950 md:text-4xl dark:text-white">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {actions}
        </div>
      </CardContent>
    </Card>
  )
}
