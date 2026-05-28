import { MANAGER_BOOKINGS, ManagerPageHeader, ManagerStatusBadge } from '../components/manager'

export function ManagerBookingsPage() {
  return (
    <div className="p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Manager // Bookings"
        title="Booking Management"
        description="Theo doi lich dat cho cua user, trang thai xac nhan va vi tri duoc giu cho."
      />

      <section className="liquid-glass-card rounded-lg p-4 md:p-5">
        <div className="overflow-hidden rounded-lg border border-theme">
          <div className="hidden grid-cols-[0.8fr_1.2fr_1fr_1fr_1fr] gap-4 border-b border-theme bg-badge px-4 py-3 text-xs font-medium uppercase tracking-[0.12em] text-subtle lg:grid">
            <span>ID</span>
            <span>Customer</span>
            <span>Plate</span>
            <span>Schedule</span>
            <span>Status</span>
          </div>
          <div className="divide-y divide-[color:var(--border)]">
            {MANAGER_BOOKINGS.map((booking) => (
              <div key={booking.id} className="grid gap-3 px-4 py-4 text-sm lg:grid-cols-[0.8fr_1.2fr_1fr_1fr_1fr] lg:items-center">
                <p className="font-semibold text-fg">{booking.id}</p>
                <div>
                  <p className="font-medium text-fg">{booking.customer}</p>
                  <p className="mt-1 text-xs text-subtle">{booking.slot}</p>
                </div>
                <p className="text-muted">{booking.plate}</p>
                <p className="text-muted">{booking.schedule}</p>
                <ManagerStatusBadge status={booking.status} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

