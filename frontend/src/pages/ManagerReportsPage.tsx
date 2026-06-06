import {
  MANAGER_BOOKINGS,
  MANAGER_GATE_LOGS,
  MANAGER_ZONES,
  ManagerPageHeader,
  ManagerStatCard,
  formatCurrency,
  getAvailableSlots,
} from '../components/manager'

export function ManagerReportsPage() {
  const revenue = MANAGER_GATE_LOGS.reduce((sum, log) => sum + log.fee, 0)
  const completedCheckouts = MANAGER_GATE_LOGS.filter((log) => log.action === 'checkout').length
  const reservedSlots = MANAGER_ZONES.reduce((sum, zone) => sum + zone.reserved, 0)
  const availableSlots = MANAGER_ZONES.reduce((sum, zone) => sum + getAvailableSlots(zone), 0)

  const reportRows = [
    { label: 'Walk-in revenue', value: formatCurrency(revenue), detail: `${completedCheckouts} completed checkouts` },
    { label: 'Booking demand', value: MANAGER_BOOKINGS.length, detail: `${reservedSlots} reserved slots now` },
    { label: 'Open capacity', value: availableSlots, detail: 'Slots ready for allocation' },
  ]

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Manager // Reports"
        title="Revenue & Operations Report"
        description="Tong hop nhanh doanh thu, nhu cau booking va suc chua con lai cho manager."
      />

      <div className="grid gap-3 md:grid-cols-3">
        {reportRows.map((row) => (
          <ManagerStatCard key={row.label} label={row.label} value={row.value} detail={row.detail} />
        ))}
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Breakdown</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Operational Notes</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-theme bg-badge p-4">
            <p className="text-sm font-semibold text-fg">Morning pressure</p>
            <p className="mt-2 text-sm text-muted">B1 motorbike zones are the busiest during office arrival hours.</p>
          </div>
          <div className="rounded-lg border border-theme bg-badge p-4">
            <p className="text-sm font-semibold text-fg">Booking balance</p>
            <p className="mt-2 text-sm text-muted">Keep a buffer between reserved slots and walk-in capacity.</p>
          </div>
          <div className="rounded-lg border border-theme bg-badge p-4">
            <p className="text-sm font-semibold text-fg">Maintenance watch</p>
            <p className="mt-2 text-sm text-muted">Review blocked slots before evening peak checkout.</p>
          </div>
        </div>
      </section>
    </div>
  )
}

