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

  return (
    <section
      id={id}
      className={`${surface} px-6 md:px-12 lg:px-16 py-20 lg:py-28 border-t border-white/[0.06] ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        <p className="text-[10px] tracking-[0.2em] text-gray-400 uppercase mb-3">
          {eyebrow}
        </p>
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-bold text-white uppercase leading-tight max-w-3xl"
          style={{ letterSpacing: '-0.02em' }}
        >
          {title}
        </h2>
        {description && (
          <p className="mt-4 text-sm md:text-base text-gray-300 max-w-2xl">
            {description}
          </p>
        )}
        <div className="mt-12 lg:mt-16">{children}</div>
      </div>
    </section>
  )
}
