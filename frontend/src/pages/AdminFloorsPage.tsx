import {
  ADMIN_FLOORS,
  AdminPageShell,
  AdminStatCard,
  AdminStatusBadge,
} from '../components/admin'

export function AdminFloorsPage() {
  const totalSlots = ADMIN_FLOORS.reduce((sum, floor) => sum + floor.totalSlots, 0)
  const occupiedSlots = ADMIN_FLOORS.reduce((sum, floor) => sum + floor.occupiedSlots, 0)
  const activeFloors = ADMIN_FLOORS.filter((floor) => floor.status === 'enabled').length

  return (
    <AdminPageShell
      eyebrow="Admin // Floors"
      title="Floor Overview"
      description="Admin xem toan bo tang, toa nha, suc chua, trang thai van hanh va manager phu trach."
    >
      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Floors" value={ADMIN_FLOORS.length} detail={`${activeFloors} floors enabled`} />
        <AdminStatCard label="Total slots" value={totalSlots} detail="Across all buildings" />
        <AdminStatCard label="Occupied" value={occupiedSlots} detail="Current occupied capacity" />
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Buildings</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Floor Directory</h2>
        </div>

        <div className="grid gap-3">
          {ADMIN_FLOORS.map((floor) => {
            const percent = Math.round((floor.occupiedSlots / floor.totalSlots) * 100)

            return (
              <article key={floor.id} className="rounded-lg border border-theme bg-badge p-4">
                <div className="grid gap-4 lg:grid-cols-[1fr_7rem_7rem_8rem_9rem] lg:items-center">
                  <div>
                    <p className="text-base font-semibold text-fg">{floor.building} / {floor.floor}</p>
                    <p className="mt-1 text-xs text-subtle">{floor.id} / {floor.manager}</p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle">Zones</p>
                    <p className="mt-1 font-semibold text-fg">{floor.zones}</p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle">Capacity</p>
                    <p className="mt-1 font-semibold text-fg">{floor.totalSlots}</p>
                  </div>
                  <div>
                    <p className="text-xs text-subtle">Occupied</p>
                    <p className="mt-1 font-semibold text-fg">{percent}%</p>
                  </div>
                  <AdminStatusBadge status={floor.status} />
                </div>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-page">
                  <div className="h-full rounded-full bg-btn-primary" style={{ width: `${percent}%` }} />
                </div>
              </article>
            )
          })}
        </div>
      </section>
    </AdminPageShell>
  )
}
