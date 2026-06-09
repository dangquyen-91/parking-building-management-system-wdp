import { useEffect, useMemo, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge } from '../components/admin'
import { adminApi, type AdminUser } from '../services/adminApi'

export function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadUsers() {
      try {
        setIsLoading(true)
        setError('')
        const response = await adminApi.getUsers({ limit: 100, sort: 'createdAt', order: 'desc' })
        if (!ignore) {
          setUsers(response.users)
          setTotal(response.total)
        }
      } catch (loadError) {
        if (!ignore) setError(loadError instanceof Error ? loadError.message : 'Cannot load users')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadUsers()

    return () => {
      ignore = true
    }
  }, [])

  const roleStats = useMemo(() => {
    const roles = ['admin', 'manager', 'staff', 'user'] as const
    return roles.map((role) => ({
      role,
      users: users.filter((user) => user.role === role).length,
    }))
  }, [users])

  const activeUsers = users.filter((user) => user.isActive).length
  const operationsUsers = users.filter((user) => user.role === 'manager' || user.role === 'staff').length

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
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="All accounts" value={isLoading ? '-' : total} detail="Users, staff, manager and admin" />
        <AdminStatCard label="Operations team" value={isLoading ? '-' : operationsUsers} detail="Manager and staff accounts" />
        <AdminStatCard label="Active accounts" value={isLoading ? '-' : activeUsers} detail="Can access the system" />
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
                {roleStats.map((role) => (
                  <option key={role.role}>{role.role}</option>
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
                {isLoading && (
                  <tr>
                    <td className="px-3 py-6 text-muted" colSpan={5}>Loading users...</td>
                  </tr>
                )}
                {!isLoading && users.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-muted" colSpan={5}>No users found.</td>
                  </tr>
                )}
                {!isLoading && users.map((user) => (
                  <tr key={user._id} className="align-top">
                    <td className="px-3 py-4">
                      <p className="font-semibold text-fg">{user.fullName}</p>
                      <p className="mt-1 text-xs text-subtle">{user.email}</p>
                    </td>
                    <td className="px-3 py-4 font-medium text-fg">{user.role}</td>
                    <td className="px-3 py-4 text-muted">{user.phone ?? '-'}</td>
                    <td className="px-3 py-4 text-muted">{user.createdAt ? new Date(user.createdAt).toLocaleString('vi-VN') : '-'}</td>
                    <td className="px-3 py-4">
                      <AdminStatusBadge status={user.isActive ? 'active' : 'inactive'} />
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
            {roleStats.map((role) => (
              <article key={role.role} className="rounded-lg border border-theme bg-badge p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold capitalize text-fg">{role.role}</p>
                    <p className="mt-1 text-xs text-subtle">Live user role</p>
                  </div>
                  <span className="text-sm font-semibold text-fg">{role.users}</span>
                </div>
                <p className="mt-3 text-xs text-muted">Fetched from /users</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </AdminPageShell>
  )
}
