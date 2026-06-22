import {
  INITIAL_TICKETS,
  StaffPageHeader,
  calculateMotorbikeFee,
  formatStaffCurrency,
} from '../../components/staff'

export function StaffShiftPage() {
  const activeTickets = INITIAL_TICKETS.filter((ticket) => ticket.status === 'active')
  const completedTickets = INITIAL_TICKETS.filter((ticket) => ticket.status === 'completed')
  const revenue = completedTickets.reduce((total, ticket) => {
    if (!ticket.checkOutAt) return total

    return total + calculateMotorbikeFee(ticket.checkInAt, ticket.checkOutAt).fee
  }, 0)

  const stats = [
    { label: 'Check-in', value: activeTickets.length + completedTickets.length, detail: 'Tong ve trong mock ca truc' },
    { label: 'Checkout', value: completedTickets.length, detail: 'Xe da ra khoi bai' },
    { label: 'Open tickets', value: activeTickets.length, detail: 'Xe con dang gui' },
    { label: 'Cash total', value: formatStaffCurrency(revenue), detail: 'Doanh thu da checkout' },
  ]

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <StaffPageHeader
        eyebrow="Staff // Shift"
        title="Shift Summary"
        description="Tong ket ca truc de ban giao cho nhan vien tiep theo hoac manager."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-lg border border-theme bg-badge p-4">
            <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">{stat.label}</p>
            <p className="mt-3 text-2xl font-semibold text-fg">{stat.value}</p>
            <p className="mt-1 text-xs text-muted">{stat.detail}</p>
          </div>
        ))}
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Handover</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Ghi chu ban giao</h2>
        </div>
        <textarea
          rows={5}
          placeholder="Nhap ghi chu: ve mat, khu dang khoa, xe can theo doi..."
          className="auth-input w-full resize-none rounded-lg border px-3 py-3 text-sm text-fg"
        />
        <button
          type="button"
          className="mt-4 h-11 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5"
        >
          Luu tong ket ca
        </button>
      </section>
    </div>
  )
}

