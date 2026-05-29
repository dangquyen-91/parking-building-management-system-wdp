import { MANAGER_STAFF, ManagerPageHeader, ManagerStatusBadge } from '../components/manager'

export function ManagerStaffPage() {
  return (
    <div className="p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Manager // Staff"
        title="Staff Monitoring"
        description="Theo doi ca truc, cong phu trach va so luot check-in/check-out cua tung nhan vien."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {MANAGER_STAFF.map((staff) => (
          <article key={staff.id} className="liquid-glass-card rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-fg">{staff.name}</p>
                <p className="mt-1 text-xs text-subtle">{staff.id} / {staff.gate}</p>
              </div>
              <ManagerStatusBadge status={staff.status} />
            </div>
            <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-subtle">Shift</dt>
                <dd className="mt-1 font-medium text-fg">{staff.shift}</dd>
              </div>
              <div>
                <dt className="text-subtle">Total</dt>
                <dd className="mt-1 font-medium text-fg">{staff.checkins + staff.checkouts}</dd>
              </div>
              <div>
                <dt className="text-subtle">Check-in</dt>
                <dd className="mt-1 font-medium text-fg">{staff.checkins}</dd>
              </div>
              <div>
                <dt className="text-subtle">Checkout</dt>
                <dd className="mt-1 font-medium text-fg">{staff.checkouts}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </div>
  )
}

