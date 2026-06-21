import type { ReactNode } from 'react'

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
    <div className="relative mx-auto max-w-[118rem] p-4 md:p-8 lg:p-10">
      <section className="relative mb-6 overflow-hidden rounded-[2rem] border border-theme bg-badge shadow-sm">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_8%_0%,rgba(139,92,246,0.28),transparent_34%),radial-gradient(circle_at_76%_0%,rgba(14,165,233,0.2),transparent_28%),radial-gradient(circle_at_100%_100%,rgba(16,185,129,0.14),transparent_30%),radial-gradient(circle_at_48%_120%,rgba(245,158,11,0.12),transparent_30%)]" />
        <div className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full border border-sky-400/10" />
        <div className="pointer-events-none absolute -right-4 -top-8 size-28 rounded-full border border-violet-400/15" />
        <div className="relative p-5 md:p-7">
          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-subtle">
                <span className="size-2 rounded-full bg-violet-500 shadow-[0_0_18px_rgba(139,92,246,0.85)]" />
                {eyebrow}
              </div>
              <h1 className="max-w-4xl text-3xl font-black tracking-tight text-fg md:text-5xl">{title}</h1>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-muted md:text-base">{description}</p>
            </div>
            {actions && <div className="shrink-0">{actions}</div>}
          </div>
        </div>
      </section>
      {children}
    </div>
  )
}
