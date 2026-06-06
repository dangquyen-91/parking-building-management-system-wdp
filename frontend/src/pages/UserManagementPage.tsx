import {
  ADMIN_ROLES,
  ADMIN_USERS,
  AdminPageShell,
  AdminStatCard,
  AdminStatusBadge,
  getRoleCount,
} from '../components/admin'

export function UserManagementPage() {
  const pendingUsers = ADMIN_USERS.filter((user) => user.status === 'pending').length
  const staffUsers = getRoleCount('Staff') + getRoleCount('Manager')

  return (
    <AdminPageShell
      eyebrow="Admin // Users"
      title="User Management"
      description="Quan ly tai khoan nguoi dung, nhan vien, manager va admin; kiem soat role truoc khi cho phep truy cap he thong."
      actions={
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="h-10 rounded-lg border border-theme-strong px-4 text-sm font-semibold text-fg transition-colors hover:bg-ghost"
          >
            Export
          </button>
          <button
            type="button"
            className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5"
          >
            Invite user
          </button>
        </div>
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="All accounts" value={ADMIN_USERS.length} detail="Users, staff, manager and admin" />
        <AdminStatCard label="Operations team" value={staffUsers} detail="Manager and staff accounts" />
        <AdminStatCard label="Pending invites" value={pendingUsers} detail="Waiting for first login" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Accounts</p>
              <h2 className="mt-1 text-base font-semibold text-fg">User Directory</h2>
            </div>
            <div className="flex gap-2">
              <select className="auth-input h-10 rounded-lg border px-3 text-sm text-fg" defaultValue="All roles">
                <option>All roles</option>
                {ADMIN_ROLES.map((role) => (
                  <option key={role.name}>{role.name}</option>
                ))}
              </select>
              <input
                className="auth-input h-10 w-40 rounded-lg border px-3 text-sm text-fg"
                placeholder="Search"
                type="search"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="border-b border-theme text-xs uppercase tracking-[0.14em] text-subtle">
                <tr>
                  <th className="px-3 py-3 font-medium">User</th>
                  <th className="px-3 py-3 font-medium">Role</th>
                  <th className="px-3 py-3 font-medium">Area</th>
                  <th className="px-3 py-3 font-medium">Last seen</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {ADMIN_USERS.map((user) => (
                  <tr key={user.id} className="align-top">
                    <td className="px-3 py-4">
                      <p className="font-semibold text-fg">{user.name}</p>
                      <p className="mt-1 text-xs text-subtle">{user.email}</p>
                    </td>
                    <td className="px-3 py-4 font-medium text-fg">{user.role}</td>
                    <td className="px-3 py-4 text-muted">{user.area}</td>
                    <td className="px-3 py-4 text-muted">{user.lastSeen}</td>
                    <td className="px-3 py-4">
                      <AdminStatusBadge status={user.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <aside className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Role Matrix</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Access Levels</h2>
          </div>

          <div className="grid gap-3">
            {ADMIN_ROLES.map((role) => (
              <article key={role.name} className="rounded-lg border border-theme bg-badge p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-fg">{role.name}</p>
                    <p className="mt-1 text-xs text-subtle">{role.scope}</p>
                  </div>
                  <span className="text-sm font-semibold text-fg">{role.users}</span>
                </div>
                <p className="mt-3 text-xs text-muted">{role.permissions.join(', ')}</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </AdminPageShell>
  )
}
