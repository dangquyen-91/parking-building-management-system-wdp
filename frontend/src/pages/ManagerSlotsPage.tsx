import {
  MANAGER_ZONES,
  ManagerPageHeader,
  ManagerStatCard,
  ManagerStatusBadge,
  getAvailableSlots,
} from '../components/manager'

export function ManagerSlotsPage() {
  const totalSlots = MANAGER_ZONES.reduce((sum, zone) => sum + zone.total, 0)
  const maintenanceSlots = MANAGER_ZONES.reduce((sum, zone) => sum + zone.maintenance, 0)

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Manager // Slots"
        title="Slots & Zones"
        description="Quan ly suc chua theo tang, khu va loai xe. Day la UI tinh cho manager review van hanh."
        actions={
          <div className="grid grid-cols-2 gap-2 sm:min-w-80">
            <ManagerStatCard label="Total" value={totalSlots} detail="All managed slots" />
            <ManagerStatCard label="Maintenance" value={maintenanceSlots} detail="Slots blocked" />
          </div>
        }
      />

      <section className="liquid-glass-card rounded-lg p-4 md:p-5">
        <div className="grid gap-3">
          {MANAGER_ZONES.map((zone) => {
            const available = getAvailableSlots(zone)

            return (
              <div key={zone.id} className="grid gap-4 rounded-lg border border-theme bg-badge p-4 lg:grid-cols-[1fr_8rem_8rem_8rem_8rem] lg:items-center">
                <div>
                  <p className="text-base font-semibold text-fg">{zone.floor} - {zone.zone}</p>
                  <p className="mt-1 text-xs text-subtle">{zone.vehicleType}</p>
                </div>
                <div>
                  <p className="text-xs text-subtle">Available</p>
                  <p className="mt-1 font-semibold text-fg">{available}</p>
                </div>
                <div>
                  <p className="text-xs text-subtle">Occupied</p>
                  <p className="mt-1 font-semibold text-fg">{zone.occupied}</p>
                </div>
                <div>
                  <p className="text-xs text-subtle">Reserved</p>
                  <p className="mt-1 font-semibold text-fg">{zone.reserved}</p>
                </div>
                <ManagerStatusBadge
                  status={zone.maintenance > 0 ? 'maintenance' : 'available'}
                  label={zone.maintenance > 0 ? `${zone.maintenance} maintenance` : 'healthy'}
                />
              </div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

