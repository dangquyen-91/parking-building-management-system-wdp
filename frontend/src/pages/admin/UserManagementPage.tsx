import { useEffect, useMemo, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge } from '../../components/admin'
import { adminApi, type AdminUser } from '../../services/adminApi'

const roleLabels: Record<AdminUser['role'], string> = {
  admin: 'Admin',
  manager: 'Manager',
  staff: 'Nhân viên',
  user: 'Người dùng',
}

const roleMeta: Record<AdminUser['role'], { detail: string; color: string; badge: string }> = {
  admin: {
    detail: 'Toàn quyền quản trị và cấu hình hệ thống',
    color: 'from-violet-500/20',
    badge: 'bg-violet-500/15 text-violet-700 dark:text-violet-200',
  },
  manager: {
    detail: 'Quản lý bãi xe, nhân viên và báo cáo',
    color: 'from-sky-500/20',
    badge: 'bg-sky-500/15 text-sky-700 dark:text-sky-200',
  },
  staff: {
    detail: 'Vận hành cổng và xử lý xe vào, ra',
    color: 'from-emerald-500/20',
    badge: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-200',
  },
  user: {
    detail: 'Đặt chỗ và sử dụng gói gửi xe',
    color: 'from-amber-500/20',
    badge: 'bg-amber-500/15 text-amber-700 dark:text-amber-200',
  },
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(-2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
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
          setUsers(response.users ?? [])
          setTotal(response.total ?? 0)
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
        <div className="grid w-full gap-3 rounded-2xl border border-theme bg-page/55 p-3 shadow-sm backdrop-blur-sm sm:grid-cols-3 xl:w-auto xl:min-w-[44rem]">
          <label className="grid gap-1 text-xs font-medium text-subtle">
            Tìm kiếm
            <input
              className="h-11 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tên, email hoặc số điện thoại"
            />
          </label>
          <label className="grid gap-1 text-xs font-medium text-subtle">
            Vai trò
            <select
              className="h-11 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15"
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
              className="h-11 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15"
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
        <div className="mb-5 rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-200">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Tất cả tài khoản" value={isLoading ? '-' : total} detail="Người dùng, nhân viên, quản lý và admin" tone="violet" />
        <AdminStatCard label="Đội vận hành" value={isLoading ? '-' : operationsUsers} detail="Tài khoản quản lý và nhân viên" tone="sky" />
        <AdminStatCard label="Đang hoạt động" value={isLoading ? '-' : activeUsers} detail="Có thể truy cập hệ thống" tone="emerald" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <section className="liquid-glass-card rounded-2xl border border-sky-500/15 p-4 shadow-sm md:p-5">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-sky-500 to-emerald-500" />
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">Tài khoản</p>
              <h2 className="mt-1 text-lg font-black text-fg">Danh sách người dùng</h2>
            </div>
            <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-200">
              {filteredUsers.length} tài khoản
            </span>
          </div>

          <div className="grid gap-3 md:hidden">
            {isLoading && <p className="rounded-2xl border border-theme bg-badge p-5 text-sm text-muted">Đang tải người dùng...</p>}
            {!isLoading && filteredUsers.length === 0 && <p className="rounded-2xl border border-theme bg-badge p-5 text-sm text-muted">Không tìm thấy người dùng.</p>}
            {!isLoading && filteredUsers.map((user) => (
              <article key={user._id} className="rounded-2xl border border-theme bg-badge p-4">
                <div className="flex items-start gap-3">
                  <span className={`flex size-11 shrink-0 items-center justify-center rounded-2xl text-xs font-black ${roleMeta[user.role].badge}`}>
                    {getInitials(user.fullName)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-fg">{user.fullName}</p>
                    <p className="mt-1 truncate text-xs text-subtle">{user.email}</p>
                  </div>
                  <AdminStatusBadge status={user.isActive ? 'active' : 'inactive'} />
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-theme pt-3 text-xs">
                  <div>
                    <p className="text-subtle">Vai trò</p>
                    <p className="mt-1 font-bold text-fg">{roleLabels[user.role]}</p>
                  </div>
                  <div>
                    <p className="text-subtle">Điện thoại</p>
                    <p className="mt-1 font-bold text-fg">{user.phone ?? '-'}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-x-auto md:block">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="border-y border-theme bg-page/35 text-xs uppercase tracking-[0.14em] text-subtle">
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
                  <tr key={user._id} className="align-top transition-colors hover:bg-sky-500/5">
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-xl text-[11px] font-black ${roleMeta[user.role].badge}`}>
                          {getInitials(user.fullName)}
                        </span>
                        <div className="min-w-0">
                          <p className="font-bold text-fg">{user.fullName}</p>
                          <p className="mt-1 text-xs text-subtle">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-4">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${roleMeta[user.role].badge}`}>
                        {roleLabels[user.role]}
                      </span>
                    </td>
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

        <aside className="liquid-glass-card rounded-2xl border border-violet-500/15 p-4 shadow-sm md:p-5">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 to-fuchsia-500" />
          <div className="mb-4">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-violet-600 dark:text-violet-300">Ma trận vai trò</p>
            <h2 className="mt-1 text-lg font-black text-fg">Cấp quyền truy cập</h2>
          </div>

          <div className="grid gap-3">
            {roleStats.map((role) => (
              <article key={role.role} className={`rounded-2xl border border-theme bg-gradient-to-br ${roleMeta[role.role].color} via-badge to-badge p-4 transition-transform hover:-translate-y-0.5`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-fg">{roleLabels[role.role]}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{roleMeta[role.role].detail}</p>
                  </div>
                  <span className={`flex size-9 items-center justify-center rounded-xl text-sm font-black ${roleMeta[role.role].badge}`}>{role.users}</span>
                </div>
              </article>
            ))}
          </div>
        </aside>
      </div>
    </AdminPageShell>
  )
}
