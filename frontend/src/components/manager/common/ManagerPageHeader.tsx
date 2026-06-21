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
    <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-theme bg-badge shadow-sm">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.2),transparent_36%),radial-gradient(circle_at_85%_10%,rgba(16,185,129,0.16),transparent_30%)]" />
      <div className="relative p-5 md:p-7">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-subtle">
              <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_18px_rgba(16,185,129,0.85)]" />
              {eyebrow}
            </div>
            <h1 className="max-w-4xl text-3xl font-black tracking-tight text-fg md:text-5xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted md:text-base">{description}</p>
          </div>
          {actions && <div className="shrink-0">{actions}</div>}
        </div>
      </div>
    </section>
  )
}
