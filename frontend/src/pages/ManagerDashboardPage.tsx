import {
  MANAGER_BOOKINGS,
  MANAGER_GATE_LOGS,
  MANAGER_STAFF,
  MANAGER_ZONES,
  ManagerPageHeader,
  ManagerStatCard,
  ManagerStatusBadge,
  formatCurrency,
  getAvailableSlots,
} from '../components/manager'

export function ManagerDashboardPage() {
  const totalSlots = MANAGER_ZONES.reduce((sum, zone) => sum + zone.total, 0)
  const occupiedSlots = MANAGER_ZONES.reduce((sum, zone) => sum + zone.occupied, 0)
  const availableSlots = MANAGER_ZONES.reduce((sum, zone) => sum + getAvailableSlots(zone), 0)
  const todayRevenue = MANAGER_GATE_LOGS.reduce((sum, log) => sum + log.fee, 0)
  const onlineStaff = MANAGER_STAFF.filter((staff) => staff.status === 'online').length

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Manager // Operations"
        title="Parking Operations"
        description="Theo doi suc chua, booking, doanh thu va hoat dong cong trong ca truc."
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <ManagerStatCard label="Occupancy" value={`${occupiedSlots}/${totalSlots}`} detail={`${availableSlots} slots available`} />
        <ManagerStatCard label="Bookings" value={MANAGER_BOOKINGS.length} detail="Confirmed, pending, cancelled" />
        <ManagerStatCard label="Revenue today" value={formatCurrency(todayRevenue)} detail="From completed checkout logs" />
        <ManagerStatCard label="Staff online" value={onlineStaff} detail={`${MANAGER_STAFF.length} staff in roster`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Capacity</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Zone Snapshot</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {MANAGER_ZONES.map((zone) => {
              const available = getAvailableSlots(zone)
              const occupiedPercent = Math.round((zone.occupied / zone.total) * 100)

              return (
                <div key={zone.id} className="rounded-lg border border-theme bg-badge p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-fg">{zone.floor} - {zone.zone}</p>
                      <p className="mt-1 text-xs text-subtle">{zone.vehicleType}</p>
                    </div>
                    <ManagerStatusBadge status={available > 0 ? 'available' : 'occupied'} label={`${available} free`} />
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-page">
                    <div className="h-full rounded-full bg-btn-primary" style={{ width: `${occupiedPercent}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-muted">{occupiedPercent}% occupied, {zone.reserved} reserved, {zone.maintenance} maintenance</p>
                </div>
              )
            })}
          </div>
        </section>

        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Live Gate</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Recent Activity</h2>
          </div>
          <div className="grid gap-2">
            {MANAGER_GATE_LOGS.map((log) => (
              <div key={log.id} className="rounded-lg border border-theme bg-badge p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fg">{log.plate}</p>
                    <p className="mt-1 text-xs text-subtle">{log.staff} / {log.time}</p>
                  </div>
                  <ManagerStatusBadge status={log.action} label={log.action} />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}

