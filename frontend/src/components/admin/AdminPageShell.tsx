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
    <div className="p-4 md:p-8 lg:p-10">
      <div className="mb-6 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-subtle">{eyebrow}</p>
          <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">{description}</p>
        </div>
        {actions}
      </div>
      {children}
    </div>
  )
}
