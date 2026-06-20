import { useEffect, useMemo, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge } from '../../components/admin'
import { adminApi, type AdminUser } from '../../services/adminApi'

const roleLabels: Record<AdminUser['role'], string> = {
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Nhân viên',
  user: 'Người dùng',
}

export function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | AdminUser['role']>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
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
        if (!ignore) setError(loadError instanceof Error ? loadError.message : 'Không thể tải người dùng')
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
  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        user.fullName.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.phone?.toLowerCase().includes(normalizedQuery)

      if (!matchesQuery) return false
      if (roleFilter !== 'all' && user.role !== roleFilter) return false
      if (statusFilter !== 'all' && user.isActive !== (statusFilter === 'active')) return false
      return true
    })
  }, [query, roleFilter, statusFilter, users])

  return (
    <AdminPageShell
      eyebrow="Admin // Người dùng"
      title="Quản lý người dùng"
      description="Quản lý tài khoản người dùng, nhân viên, quản lý và admin; kiểm soát vai trò trước khi cho phép truy cập hệ thống."
      actions={
        <div className="grid w-full gap-3 sm:grid-cols-3 xl:w-auto xl:min-w-[42rem]">
          <label className="grid gap-1 text-xs font-medium text-subtle">
            Tìm kiếm
            <input
              className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-btn-primary"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tên, email hoặc số điện thoại"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium text-subtle">
            Vai trò
            <select
              className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as typeof roleFilter)}
            >
              <option value="all">Tất cả vai trò</option>
              {roleStats.map((role) => (
                <option key={role.role} value={role.role}>{roleLabels[role.role]}</option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs font-medium text-subtle">
            Trạng thái
            <select
              className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã khóa</option>
            </select>
          </label>
        </div>
      }
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Tất cả tài khoản" value={isLoading ? '-' : total} detail="Người dùng, nhân viên, quản lý và admin" />
        <AdminStatCard label="Đội vận hành" value={isLoading ? '-' : operationsUsers} detail="Tài khoản quản lý và nhân viên" />
        <AdminStatCard label="Đang hoạt động" value={isLoading ? '-' : activeUsers} detail="Có thể truy cập hệ thống" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Tài khoản</p>
              <h2 className="mt-1 text-base font-semibold text-fg">Danh sách người dùng</h2>
            </div>
            <span className="rounded-full border border-theme px-3 py-1 text-xs font-semibold text-subtle">
              {filteredUsers.length} tài khoản
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="border-b border-theme text-xs uppercase tracking-[0.14em] text-subtle">
                <tr>
                  <th className="px-3 py-3 font-medium">Người dùng</th>
                  <th className="px-3 py-3 font-medium">Vai trò</th>
                  <th className="px-3 py-3 font-medium">Điện thoại</th>
                  <th className="px-3 py-3 font-medium">Ngày tạo</th>
                  <th className="px-3 py-3 font-medium">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {isLoading && (
                  <tr>
                    <td className="px-3 py-6 text-muted" colSpan={5}>Đang tải người dùng...</td>
                  </tr>
                )}
                {!isLoading && filteredUsers.length === 0 && (
                  <tr>
                    <td className="px-3 py-6 text-muted" colSpan={5}>Không tìm thấy người dùng.</td>
                  </tr>
                )}
                {!isLoading && filteredUsers.map((user) => (
                  <tr key={user._id} className="align-top">
                    <td className="px-3 py-4">
                      <p className="font-semibold text-fg">{user.fullName}</p>
                      <p className="mt-1 text-xs text-subtle">{user.email}</p>
                    </td>
                    <td className="px-3 py-4 font-medium text-fg">{roleLabels[user.role]}</td>
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
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Ma trận vai trò</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Cấp quyền truy cập</h2>
          </div>

          <div className="grid gap-3">
            {roleStats.map((role) => (
              <article key={role.role} className="rounded-lg border border-theme bg-badge p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-fg">{roleLabels[role.role]}</p>
                    <p className="mt-1 text-xs text-subtle">Vai trò người dùng từ API</p>
                  </div>
                  <span className="text-sm font-semibold text-fg">{role.users}</span>
                </div>
                <p className="mt-3 text-xs text-muted">Lấy dữ liệu từ /users</p>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </AdminPageShell>
  )
}
