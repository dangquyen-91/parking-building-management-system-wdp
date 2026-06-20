import type { ReactNode } from 'react'

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
    <section className="relative mb-6 overflow-hidden rounded-3xl border border-theme bg-badge p-5 shadow-xl shadow-black/5 md:p-7">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(16,185,129,0.14),transparent_30%)]" />
      <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.22em] text-subtle">
            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.85)]" />
            {eyebrow}
          </div>
          <h1 className="max-w-4xl text-3xl font-black tracking-tight text-fg md:text-5xl">{title}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted md:text-base">{description}</p>
        </div>
        {actions && <div className="shrink-0">{actions}</div>}
      </div>
    </section>
  )
}

