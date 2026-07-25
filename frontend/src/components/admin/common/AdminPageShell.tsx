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
    <div className="relative mx-auto max-w-[118rem] p-4 md:p-6 lg:p-8">
      <Card className="relative mb-6 overflow-hidden border-violet-500/20 bg-gradient-to-br from-white via-violet-50/70 to-sky-50/70 shadow-sm dark:from-slate-950 dark:via-violet-950/25 dark:to-sky-950/20">
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-violet-500 via-sky-500 to-emerald-500" />
        <div className="pointer-events-none absolute right-0 top-0 h-40 w-80 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.18),transparent_65%)]" />
        <CardContent className="relative p-5 md:p-6">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0">
              <div className="mb-2 flex max-w-full items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-700 dark:text-violet-300">
                <span className="size-1.5 shrink-0 rounded-full bg-violet-500" />
                {eyebrow}
              </div>
              <h1 className="max-w-4xl break-words text-2xl font-bold tracking-tight text-slate-950 md:text-3xl dark:text-white">
                {title}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            </div>
            {actions && (
              <div className="min-w-0 w-full xl:w-auto xl:max-w-[48rem] xl:shrink-0">
                {actions}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      {children}
    </div>
  )
}
