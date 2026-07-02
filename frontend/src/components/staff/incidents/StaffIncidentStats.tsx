type IncidentStats = {
  open: number
  inProgress: number
  resolved: number
}

export function StaffIncidentStats({ stats }: { stats: IncidentStats }) {
  return (
    <section className="mb-5 grid gap-3 sm:grid-cols-3">
      <StatCard label="Mới gửi" value={stats.open} tone="amber" />
      <StatCard label="Đang xử lý" value={stats.inProgress} tone="sky" />
      <StatCard label="Đã xử lý" value={stats.resolved} tone="emerald" />
    </section>
  )
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string
  value: number
  tone: 'amber' | 'sky' | 'emerald'
}) {
  const toneClass = {
    amber: 'text-amber-600 dark:text-amber-300',
    sky: 'text-sky-600 dark:text-sky-300',
    emerald: 'text-emerald-600 dark:text-emerald-300',
  }[tone]

  return (
    <div className="liquid-glass-card rounded-2xl p-5">
      <p className={`text-3xl font-black ${toneClass}`}>{value}</p>
      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">{label}</p>
    </div>
  )
}
