import {
  ADMIN_SLOTS,
  AdminPageShell,
  AdminStatCard,
  AdminStatusBadge,
} from '../components/admin'

export function AdminSlotsPage() {
  const availableSlots = ADMIN_SLOTS.filter((slot) => slot.status === 'available').length
  const reservedSlots = ADMIN_SLOTS.filter((slot) => slot.status === 'reserved').length
  const maintenanceSlots = ADMIN_SLOTS.filter((slot) => slot.status === 'maintenance').length

  return (
    <AdminPageShell
      eyebrow="Admin // Slots"
      title="Slot Inventory"
      description="Admin xem tat ca slot theo toa nha, tang, khu, loai xe, booking gan voi slot va trang thai hien tai."
    >
      <div className="grid gap-3 md:grid-cols-4">
        <AdminStatCard label="All slots" value={ADMIN_SLOTS.length} detail="Visible to admin" />
        <AdminStatCard label="Available" value={availableSlots} detail="Ready for booking" />
        <AdminStatCard label="Reserved" value={reservedSlots} detail="Held by booking" />
        <AdminStatCard label="Maintenance" value={maintenanceSlots} detail="Blocked slots" />
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Inventory</p>
            <h2 className="mt-1 text-base font-semibold text-fg">All Parking Slots</h2>
          </div>
          <select className="auth-input h-10 rounded-lg border px-3 text-sm text-fg" defaultValue="All buildings">
            <option>All buildings</option>
            <option>Tower A</option>
            <option>Tower B</option>
            <option>Tower C</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[52rem] text-left text-sm">
            <thead className="border-b border-theme text-xs uppercase tracking-[0.14em] text-subtle">
              <tr>
                <th className="px-3 py-3 font-medium">Slot</th>
                <th className="px-3 py-3 font-medium">Location</th>
                <th className="px-3 py-3 font-medium">Vehicle</th>
                <th className="px-3 py-3 font-medium">Booking</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {ADMIN_SLOTS.map((slot) => (
                <tr key={slot.id} className="align-top">
                  <td className="px-3 py-4">
                    <p className="font-semibold text-fg">{slot.code}</p>
                    <p className="mt-1 text-xs text-subtle">{slot.id}</p>
                  </td>
                  <td className="px-3 py-4 text-muted">{slot.building} / {slot.floor} / {slot.zone}</td>
                  <td className="px-3 py-4 font-medium text-fg">{slot.vehicleType}</td>
                  <td className="px-3 py-4 text-muted">{slot.bookingId}</td>
                  <td className="px-3 py-4">
                    <AdminStatusBadge status={slot.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPageShell>
  )
}
