import type { ReactNode } from 'react'

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
  const surface = tone === 'alt' ? 'section-surface-alt' : 'section-surface'
  const glow = tone === 'alt'
    ? 'bg-[radial-gradient(circle_at_8%_10%,rgba(139,92,246,0.10),transparent_28%),radial-gradient(circle_at_92%_85%,rgba(14,165,233,0.10),transparent_30%)]'
    : 'bg-[radial-gradient(circle_at_92%_8%,rgba(16,185,129,0.09),transparent_28%),radial-gradient(circle_at_5%_90%,rgba(245,158,11,0.08),transparent_30%)]'

  return (
    <section
      id={id}
      className={`${surface} relative overflow-hidden border-t border-theme px-6 py-16 md:px-12 lg:px-16 lg:py-24 ${className}`}
    >
      <div className={`pointer-events-none absolute inset-0 ${glow}`} />
      <div className="relative mx-auto max-w-7xl">
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-subtle">
          {eyebrow}
        </p>
        <h2
          className="max-w-3xl text-3xl font-bold leading-[1.08] text-fg md:text-4xl lg:text-5xl"
          style={{ letterSpacing: '-0.02em' }}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-4 max-w-xl text-sm leading-7 text-muted md:text-base">
            {description}
          </p>
        )}
        <div className="mt-10 lg:mt-12">{children}</div>
      </div>
    </section>
  )
}
