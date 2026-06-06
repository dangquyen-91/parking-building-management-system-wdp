type AdminStatCardProps = {
  label: string
  value: string | number
  detail: string
}

export function AdminStatCard({ label, value, detail }: AdminStatCardProps) {
  return (
    <div className="rounded-lg border border-theme bg-badge p-4">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-fg">{value}</p>
      <p className="mt-1 text-xs text-muted">{detail}</p>
    </div>
  )
}
