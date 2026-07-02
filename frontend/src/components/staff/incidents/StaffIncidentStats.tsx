type IncidentStats = {
  open: number
  inProgress: number
  resolved: number
}

const STAT_ITEMS = [
  {
    key: 'open',
    label: 'Mới gửi',
    detail: 'Cần kiểm tra ngay',
    accent: 'from-amber-400/35 to-orange-500/10',
    icon: '!',
  },
  {
    key: 'inProgress',
    label: 'Đang xử lý',
    detail: 'Đang liên hệ chủ xe',
    accent: 'from-sky-400/35 to-cyan-500/10',
    icon: '→',
  },
  {
    key: 'resolved',
    label: 'Đã xử lý',
    detail: 'Đã đóng khiếu nại',
    accent: 'from-emerald-400/35 to-teal-500/10',
    icon: '✓',
  },
] as const

export function StaffIncidentStats({ stats }: { stats: IncidentStats }) {
  return (
    <section className="mb-5 grid gap-3 md:grid-cols-3">
      {STAT_ITEMS.map((item) => (
        <article key={item.key} className="liquid-glass-card relative overflow-hidden rounded-3xl p-5">
          <div className={`absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l ${item.accent}`} />
          <div className="relative flex items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-subtle">{item.label}</p>
              <p className="mt-2 text-4xl font-black tabular-nums text-fg">{stats[item.key]}</p>
              <p className="mt-1 text-sm text-muted">{item.detail}</p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-2xl border border-theme bg-badge text-xl font-black text-fg shadow-sm">
              {item.icon}
            </span>
          </div>
        </article>
      ))}
    </section>
  )
}
