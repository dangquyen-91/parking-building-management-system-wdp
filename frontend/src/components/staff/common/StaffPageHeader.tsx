import type { ReactNode } from 'react'

type StaffPageHeaderProps = {
  eyebrow: string
  title: string
  description: string
  actions?: ReactNode
}

export function StaffPageHeader({ eyebrow, title, description, actions }: StaffPageHeaderProps) {
  return (
    <div className="mb-6 overflow-hidden rounded-[2rem] border border-theme bg-badge shadow-sm">
      <div className="relative p-5 md:p-7">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-sky-500/10 to-transparent" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-subtle">
              <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.9)]" />
              {eyebrow}
            </div>
            <h1 className="text-3xl font-black tracking-tight text-fg md:text-4xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">{description}</p>
          </div>
          {actions}
        </div>
      </div>
    </div>
  )
}
