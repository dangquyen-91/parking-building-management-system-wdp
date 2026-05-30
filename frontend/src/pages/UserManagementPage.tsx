import {
  ADMIN_ROLES,
  AdminPageShell,
  AdminStatCard,
  AdminStatusBadge,
} from '../components/admin'
import { useEffect, useMemo, useState } from 'react'
import { adminApi, type AdminUserDto } from '../services/adminApi'
import type { AuthRole } from '../services/authApi'

const roleOptions: AuthRole[] = ['admin', 'manager', 'staff', 'user']

export function UserManagementPage() {
  const [users, setUsers] = useState<AdminUserDto[]>([])
  const [roleFilter, setRoleFilter] = useState<AuthRole | 'all'>('all')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string>()
  const [error, setError] = useState<string>()

  useEffect(() => {
    let isMounted = true

    async function loadUsers() {
      setIsLoading(true)
      setError(undefined)

      try {
        const data = await adminApi.getUsers({ limit: 100, role: roleFilter === 'all' ? undefined : roleFilter })
        if (isMounted) setUsers(data.users)
      } catch (err) {
        if (isMounted) setError(err instanceof Error ? err.message : 'Khong the tai danh sach user')
      } finally {
        if (isMounted) setIsLoading(false)
      }
    }

    loadUsers()

    return () => {
      isMounted = false
    }
  }, [roleFilter])

  const visibleUsers = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return users

    return users.filter((user) =>
      [user.fullName, user.email, user.phone, user.role].some((value) => value?.toLowerCase().includes(keyword)),
    )
  }, [search, users])

  const operationsUsers = users.filter((user) => user.role === 'manager' || user.role === 'staff').length
  const inactiveUsers = users.filter((user) => !user.isActive).length

  async function refreshUsers() {
    const data = await adminApi.getUsers({ limit: 100, role: roleFilter === 'all' ? undefined : roleFilter })
    setUsers(data.users)
  }

  async function handleRoleChange(userId: string, role: AuthRole) {
    setSavingId(userId)
    setError(undefined)

    try {
      await adminApi.changeUserRole(userId, role)
      await refreshUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the doi role')
    } finally {
      setSavingId(undefined)
    }
  }

  async function handleStatusToggle(user: AdminUserDto) {
    setSavingId(user._id)
    setError(undefined)

    try {
      await adminApi.updateUserStatus(user._id, !user.isActive)
      await refreshUsers()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the cap nhat trang thai user')
    } finally {
      setSavingId(undefined)
    }
  }

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
      {error ? (
        <div className="mb-5 rounded-lg border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="All accounts" value={isLoading ? '...' : users.length} detail="Users, staff, manager and admin" />
        <AdminStatCard label="Operations team" value={operationsUsers} detail="Manager and staff accounts" />
        <AdminStatCard label="Inactive accounts" value={inactiveUsers} detail="Can be reactivated by admin" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Accounts</p>
              <h2 className="mt-1 text-base font-semibold text-fg">User Directory</h2>
            </div>
            <div className="flex gap-2">
              <select
                className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                value={roleFilter}
                onChange={(event) => setRoleFilter(event.target.value as AuthRole | 'all')}
              >
                <option value="all">All roles</option>
                {roleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
              <input
                className="auth-input h-10 w-40 rounded-lg border px-3 text-sm text-fg"
                placeholder="Search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="border-b border-theme text-xs uppercase tracking-[0.14em] text-subtle">
                <tr>
                  <th className="px-3 py-3 font-medium">User</th>
                  <th className="px-3 py-3 font-medium">Role</th>
                  <th className="px-3 py-3 font-medium">Phone</th>
                  <th className="px-3 py-3 font-medium">Created</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {visibleUsers.map((user) => (
                  <tr key={user._id} className="align-top">
                    <td className="px-3 py-4">
                      <p className="font-semibold text-fg">{user.fullName}</p>
                      <p className="mt-1 text-xs text-subtle">{user.email}</p>
                    </td>
                    <td className="px-3 py-4">
                      <select
                        className="auth-input h-9 rounded-lg border px-2 text-sm text-fg"
                        value={user.role}
                        disabled={savingId === user._id}
                        onChange={(event) => handleRoleChange(user._id, event.target.value as AuthRole)}
                      >
                        {roleOptions.map((role) => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-4 text-muted">{user.phone ?? '-'}</td>
                    <td className="px-3 py-4 text-muted">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </td>
                    <td className="px-3 py-4">
                      <AdminStatusBadge status={user.isActive ? 'active' : 'locked'} label={user.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-3 py-4">
                      <button
                        type="button"
                        className="h-9 rounded-lg border border-theme-strong px-3 text-xs font-semibold text-fg transition-colors hover:bg-ghost disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={savingId === user._id}
                        onClick={() => handleStatusToggle(user)}
                      >
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && visibleUsers.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Khong co user phu hop bo loc.</p>
            ) : null}
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
