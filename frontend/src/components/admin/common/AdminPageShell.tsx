import type { ReactNode } from 'react'
import { Card, CardContent } from '../../ui/card'

type AdminPageShellProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
  children?: ReactNode
}

export function AdminPageShell({
  eyebrow,
  title,
  description,
  actions,
  children,
}: AdminPageShellProps) {
  return (
    <div className="relative mx-auto max-w-[100rem] p-4 md:p-6 lg:p-8">
      <Card className="relative mb-6 overflow-hidden">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-primary" />
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-80 bg-[radial-gradient(circle_at_top_right,hsl(var(--primary)/0.12),transparent_65%)]" />
        <CardContent className="relative p-5 md:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                <span className="size-1.5 rounded-full bg-primary" />
                {eyebrow}
              </div>
              <h1 className="max-w-4xl text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
            </div>
            {actions && <div className="w-full xl:w-auto xl:shrink-0">{actions}</div>}
          </div>
        </CardContent>
      </Card>
      {children}
    </div>
  )
}

