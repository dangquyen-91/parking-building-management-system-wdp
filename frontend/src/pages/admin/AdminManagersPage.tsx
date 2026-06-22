import { useEffect, useMemo, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge } from '../../components/admin'
import { adminApi, type AdminUser } from '../../services/adminApi'

type ManagerStatusFilter = 'all' | 'active' | 'inactive'

export function AdminManagersPage() {
  const [managers, setManagers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ManagerStatusFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [snapshotTime] = useState(() => Date.now())

  async function loadManagers() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await adminApi.getUsers({ role: 'manager', limit: 100, sort: 'fullName', order: 'asc' })
      setManagers(response.users ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách manager.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadManagers(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  const filteredManagers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return managers.filter((manager) => {
      const matchesQuery =
        !normalizedQuery ||
        manager.fullName.toLowerCase().includes(normalizedQuery) ||
        manager.email.toLowerCase().includes(normalizedQuery) ||
        manager.phone?.toLowerCase().includes(normalizedQuery)

      if (!matchesQuery) return false
      if (statusFilter !== 'all' && manager.isActive !== (statusFilter === 'active')) return false
      return true
    })
  }, [managers, query, statusFilter])

  async function handleToggleStatus(manager: AdminUser) {
    setUpdatingId(manager._id)
    setError(null)

    try {
      const result = await adminApi.updateUserStatus(manager._id, !manager.isActive)
      setManagers((current) => current.map((item) => (item._id === result.user._id ? result.user : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái manager.')
    } finally {
      setUpdatingId(null)
    }
  }

  const activeManagers = managers.filter((manager) => manager.isActive).length
  const inactiveManagers = managers.length - activeManagers
  const recentlyCreated = managers.filter((manager) => {
    if (!manager.createdAt) return false
    return snapshotTime - new Date(manager.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000
  }).length

  return (
    <AdminPageShell
      eyebrow="Admin // Manager"
      title="Quản lý manager"
      description="Theo dõi tài khoản manager, trạng thái truy cập và thông tin liên hệ của đội ngũ quản lý vận hành."
      actions={
        <div className="grid w-full gap-3 rounded-2xl border border-theme bg-page/55 p-3 shadow-sm backdrop-blur-sm sm:grid-cols-2 xl:w-auto xl:min-w-[34rem]">
          <label className="grid gap-1 text-xs font-medium text-subtle">
            Tìm manager
            <input
              className="h-11 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tên, email hoặc số điện thoại"
            />
          </label>

          <label className="grid gap-1 text-xs font-medium text-subtle">
            Trạng thái tài khoản
            <select
              className="h-11 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15"
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as ManagerStatusFilter)}
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã khóa</option>
            </select>
          </label>
        </div>
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminStatCard label="Tổng manager" value={isLoading ? '-' : managers.length} detail="Tài khoản có vai trò manager" tone="sky" />
        <AdminStatCard label="Đang hoạt động" value={isLoading ? '-' : activeManagers} detail="Có thể truy cập khu manager" tone="emerald" />
        <AdminStatCard label="Đã khóa" value={isLoading ? '-' : inactiveManagers} detail="Tạm ngưng quyền truy cập" tone="amber" />
        <AdminStatCard label="Manager mới" value={isLoading ? '-' : recentlyCreated} detail="Tạo trong 30 ngày gần nhất" tone="violet" />
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-200">
          <span>{error}</span>
          <button type="button" className="font-semibold hover:underline" onClick={() => void loadManagers()}>
            Thử lại
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="liquid-glass-card rounded-2xl border border-theme p-6 text-center text-sm text-muted">Đang tải danh sách manager...</div>
      ) : filteredManagers.length === 0 ? (
        <div className="liquid-glass-card rounded-2xl border border-dashed border-theme p-8 text-center text-sm text-muted">Không có manager phù hợp.</div>
      ) : (
        <section className="liquid-glass-card rounded-2xl border border-sky-500/15 p-4 shadow-sm md:p-5">
          <span className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-sky-500 via-violet-500 to-fuchsia-500" />
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">Danh sách manager</p>
              <h2 className="mt-1 text-lg font-black text-fg">Tài khoản quản lý</h2>
            </div>
            <span className="rounded-full border border-sky-500/20 bg-sky-500/10 px-3 py-1 text-xs font-bold text-sky-700 dark:text-sky-200">
              {filteredManagers.length} manager
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredManagers.map((manager) => (
              <article key={manager._id} className="group relative overflow-hidden rounded-2xl border border-theme bg-gradient-to-br from-sky-500/10 via-badge to-badge p-5 transition-all hover:-translate-y-0.5 hover:border-sky-500/25 hover:shadow-lg">
                <span className={`absolute inset-y-0 left-0 w-1 ${manager.isActive ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-sky-500/15 text-xs font-black text-sky-700 dark:text-sky-200">
                      {manager.fullName.trim().split(/\s+/).slice(-2).map((part) => part[0]).join('').toUpperCase()}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-black text-fg">{manager.fullName}</p>
                      <p className="mt-1 truncate text-xs text-subtle">{manager.email}</p>
                    </div>
                  </div>
                  <AdminStatusBadge status={manager.isActive ? 'active' : 'inactive'} />
                </div>

                <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-xl border border-theme bg-page/35 p-3">
                    <dt className="text-xs text-subtle">Điện thoại</dt>
                    <dd className="mt-1 truncate font-bold text-fg">{manager.phone ?? '-'}</dd>
                  </div>
                  <div className="rounded-xl border border-theme bg-page/35 p-3">
                    <dt className="text-xs text-subtle">Ngày tạo</dt>
                    <dd className="mt-1 font-bold text-fg">
                      {manager.createdAt ? new Date(manager.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </dd>
                  </div>
                </dl>

                <p className="mt-4 text-xs leading-5 text-muted">Quản lý hạ tầng, nhân viên, booking và báo cáo vận hành.</p>

                <button
                  type="button"
                  disabled={updatingId === manager._id}
                  onClick={() => void handleToggleStatus(manager)}
                  className={`mt-5 h-11 w-full rounded-xl border px-4 text-sm font-bold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                    manager.isActive
                      ? 'border-rose-500/25 bg-rose-500/10 text-rose-700 hover:bg-rose-500 hover:text-white dark:text-rose-200'
                      : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500 hover:text-white dark:text-emerald-200'
                  }`}
                >
                  {updatingId === manager._id
                    ? 'Đang cập nhật...'
                    : manager.isActive
                      ? 'Khóa tài khoản'
                      : 'Mở lại tài khoản'}
                </button>
              </article>
            ))}
          </div>
        </section>
      )}
    </AdminPageShell>
  )
}
