import {
  ADMIN_BOOKINGS,
  AdminPageShell,
  AdminStatCard,
  AdminStatusBadge,
  formatAdminCurrency,
} from '../components/admin'

export function AdminBookingsPage() {
  const confirmedBookings = ADMIN_BOOKINGS.filter((booking) => booking.status === 'confirmed').length
  const pendingBookings = ADMIN_BOOKINGS.filter((booking) => booking.status === 'pending').length
  const revenue = ADMIN_BOOKINGS
    .filter((booking) => booking.payment === 'Paid')
    .reduce((sum, booking) => sum + booking.amount, 0)

  return (
    <AdminPageShell
      eyebrow="Admin // Bookings"
      title="Booking Overview"
      description="Admin xem tat ca booking cua user, vi tri slot, bien so, thanh toan va trang thai dat cho."
    >
      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Bookings" value={ADMIN_BOOKINGS.length} detail={`${confirmedBookings} confirmed`} />
        <AdminStatCard label="Pending" value={pendingBookings} detail="Need confirmation or payment" />
        <AdminStatCard label="Paid revenue" value={formatAdminCurrency(revenue)} detail="From paid bookings" />
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Reservations</p>
            <h2 className="mt-1 text-base font-semibold text-fg">All Bookings</h2>
          </div>
          <input
            className="auth-input h-10 w-full rounded-lg border px-3 text-sm text-fg md:w-56"
            placeholder="Search booking"
            type="search"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[58rem] text-left text-sm">
            <thead className="border-b border-theme text-xs uppercase tracking-[0.14em] text-subtle">
              <tr>
                <th className="px-3 py-3 font-medium">Booking</th>
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">Slot</th>
                <th className="px-3 py-3 font-medium">Schedule</th>
                <th className="px-3 py-3 font-medium">Payment</th>
                <th className="px-3 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {ADMIN_BOOKINGS.map((booking) => (
                <tr key={booking.id} className="align-top">
                  <td className="px-3 py-4 font-semibold text-fg">{booking.id}</td>
                  <td className="px-3 py-4">
                    <p className="font-medium text-fg">{booking.customer}</p>
                    <p className="mt-1 text-xs text-subtle">{booking.plate}</p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="font-medium text-fg">{booking.slot}</p>
                    <p className="mt-1 text-xs text-subtle">{booking.building}</p>
                  </td>
                  <td className="px-3 py-4 text-muted">{booking.schedule}</td>
                  <td className="px-3 py-4">
                    <p className="font-medium text-fg">{booking.payment}</p>
                    <p className="mt-1 text-xs text-subtle">{formatAdminCurrency(booking.amount)}</p>
                  </td>
                  <td className="px-3 py-4">
                    <AdminStatusBadge status={booking.status} />
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
