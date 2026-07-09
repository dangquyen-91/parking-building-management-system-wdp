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
    <Card className="mb-6 shadow-sm">
      <CardContent className="p-5 md:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge variant="outline" className="mb-3 gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              {eyebrow}
            </Badge>
            <h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-foreground md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground md:text-base">{description}</p>
          </div>
          {actions && <div className="w-full xl:w-auto xl:shrink-0">{actions}</div>}
        </div>
      </CardContent>
    </Card>
  )
}


