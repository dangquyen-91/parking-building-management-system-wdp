import {
  ADMIN_AUDIT_LOGS,
  ADMIN_CONTROLS,
  ADMIN_ROLES,
  ADMIN_USERS,
  AdminPageShell,
  AdminStatCard,
  AdminStatusBadge,
} from '../components/admin'

export function DashboardPage() {
  const activeUsers = ADMIN_USERS.filter((user) => user.status === 'active').length
  const lockedUsers = ADMIN_USERS.filter((user) => user.status === 'locked').length
  const permissionGroups = ADMIN_ROLES.reduce((sum, role) => sum + role.permissions.length, 0)
  const warningLogs = ADMIN_AUDIT_LOGS.filter((log) => log.status !== 'enabled').length

  return (
    <AdminPageShell
      eyebrow="Admin // Dashboard"
      title="System Administration"
      description="Quan ly tai khoan, phan quyen, cau hinh he thong va nhat ky bao mat cho toan bo parking platform."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Active users" value={activeUsers} detail={`${ADMIN_USERS.length} accounts in sample data`} />
        <AdminStatCard label="Role groups" value={ADMIN_ROLES.length} detail={`${permissionGroups} permission entries`} />
        <AdminStatCard label="Locked accounts" value={lockedUsers} detail="Need admin review before unlock" />
        <AdminStatCard label="Audit alerts" value={warningLogs} detail="Security events needing attention" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Admin Scope</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Nen quan ly nhung gi?</h2>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {ADMIN_CONTROLS.map((control) => (
              <article key={control.title} className="rounded-lg border border-theme bg-badge p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fg">{control.title}</p>
                    <p className="mt-2 text-sm text-muted">{control.detail}</p>
                  </div>
                  <AdminStatusBadge status={control.status} label={control.status} />
                </div>
                <p className="mt-4 text-xs text-subtle">Owner: {control.owner}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Security</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Recent Audit Log</h2>
          </div>

          <div className="grid gap-2">
            {ADMIN_AUDIT_LOGS.map((log) => (
              <div key={log.id} className="rounded-lg border border-theme bg-badge p-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-fg">{log.action}</p>
                    <p className="mt-1 text-xs text-subtle">{log.actor} / {log.time}</p>
                  </div>
                  <AdminStatusBadge status={log.status} />
                </div>
                <p className="mt-3 text-xs text-muted">{log.target}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4">
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Roles</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Permission Ownership</h2>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {ADMIN_ROLES.map((role) => (
            <article key={role.name} className="rounded-lg border border-theme bg-badge p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-fg">{role.name}</p>
                  <p className="mt-1 text-xs text-subtle">{role.scope}</p>
                </div>
                <span className="rounded-full border border-theme px-2 py-1 text-[10px] text-subtle">
                  {role.users} users
                </span>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {role.permissions.map((permission) => (
                  <span key={permission} className="rounded-full border border-theme bg-page px-2 py-1 text-[11px] text-muted">
                    {permission}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>
    </AdminPageShell>
  )
}
