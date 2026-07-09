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
    <Card className="mb-6">
      <CardContent className="p-5 md:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <Badge variant="secondary" className="mb-3">
              {eyebrow}
            </Badge>
            <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          {actions}
        </div>
      </CardContent>
    </Card>
  )
}
