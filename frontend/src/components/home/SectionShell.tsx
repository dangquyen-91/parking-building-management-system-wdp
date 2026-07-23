import type { ReactNode } from 'react'
import { Badge } from '../ui/badge'

type SectionTone = 'base' | 'alt'

type SectionShellProps = {
  id?: string
  eyebrow: string
  title: string
  description?: string
  children: ReactNode
  className?: string
  tone?: SectionTone
}

export function SectionShell({
  id,
  eyebrow,
  title,
  description,
  children,
  className = '',
  tone = 'base',
}: SectionShellProps) {
  const surface = tone === 'alt'
    ? 'bg-white dark:bg-gradient-to-br dark:from-violet-950/60 dark:via-sky-950/50 dark:to-emerald-950/45'
    : 'bg-white dark:bg-background/58'

  return (
    <section id={id} className={`relative overflow-hidden ${surface} border-t border-violet-200/50 px-6 py-16 dark:border-violet-900/35 md:px-12 lg:px-16 lg:py-24 ${className}`}>
      <div className="pointer-events-none absolute -left-28 top-16 size-72 rounded-full bg-transparent blur-3xl dark:bg-violet-500/18" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-24 bottom-0 size-80 rounded-full bg-transparent blur-3xl dark:bg-sky-500/18" aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl">
        <Badge variant="secondary" className="mb-3 border border-violet-500/15 bg-violet-500/10 text-violet-700 dark:text-violet-200">
          {eyebrow}
        </Badge>
        <h2 className="max-w-3xl text-3xl font-bold leading-tight text-slate-950 dark:bg-gradient-to-r dark:from-violet-200 dark:via-sky-200 dark:to-emerald-200 dark:bg-clip-text dark:text-transparent md:text-4xl lg:text-5xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-700 dark:text-muted-foreground md:text-base">
            {description}
          </p>
        )}
        <div className="mt-10 lg:mt-12">{children}</div>
      </div>
    </section>
  )
}
