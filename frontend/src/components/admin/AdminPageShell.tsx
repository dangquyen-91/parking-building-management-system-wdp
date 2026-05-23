type AdminPageShellProps = {
  eyebrow: string
  title: string
  description: string
}

export function AdminPageShell({ eyebrow, title, description }: AdminPageShellProps) {
  return (
    <div className="p-6 md:p-10 lg:p-12">
      <p className="text-[10px] tracking-[0.2em] text-subtle uppercase mb-3">{eyebrow}</p>
      <h1 className="text-3xl md:text-4xl font-bold text-fg tracking-tight">{title}</h1>
      <p className="mt-3 text-sm text-muted max-w-xl">{description}</p>
    </div>
  )
}
