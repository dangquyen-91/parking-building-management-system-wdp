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
  const surface = tone === 'alt' ? 'bg-muted/30' : 'bg-background'

  return (
    <section id={id} className={`${surface} border-t px-6 py-16 md:px-12 lg:px-16 lg:py-24 ${className}`}>
      <div className="mx-auto max-w-7xl">
        <Badge variant="secondary" className="mb-3">
          {eyebrow}
        </Badge>
        <h2 className="max-w-3xl text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
          {title}
        </h2>
        {description && (
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
            {description}
          </p>
        )}
        <div className="mt-10 lg:mt-12">{children}</div>
      </div>
    </section>
  )
}
