import { useEffect, useMemo, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge } from '../components/admin'
import { adminApi, type AdminUser } from '../services/adminApi'

type ManagerStatusFilter = 'all' | 'active' | 'inactive'

export function AdminManagersPage() {
  const [managers, setManagers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ManagerStatusFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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
    return Date.now() - new Date(manager.createdAt).getTime() <= 30 * 24 * 60 * 60 * 1000
  }).length

  return (
    <AdminPageShell
      eyebrow="Admin // Manager"
      title="Quản lý manager"
      description="Theo dõi tài khoản manager, trạng thái truy cập và thông tin liên hệ của đội ngũ quản lý vận hành."
      actions={
        <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:min-w-[32rem]">
          <label className="grid gap-1 text-xs font-medium text-subtle">
            Tìm manager
            <input
              className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-btn-primary"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Tên, email hoặc số điện thoại"
            />
          </label>

          <label className="grid gap-1 text-xs font-medium text-subtle">
            Trạng thái tài khoản
            <select
              className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
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
        <AdminStatCard label="Tổng manager" value={isLoading ? '-' : managers.length} detail="Tài khoản có vai trò manager" />
        <AdminStatCard label="Đang hoạt động" value={isLoading ? '-' : activeManagers} detail="Có thể truy cập khu manager" />
        <AdminStatCard label="Đã khóa" value={isLoading ? '-' : inactiveManagers} detail="Tạm ngưng quyền truy cập" />
        <AdminStatCard label="Manager mới" value={isLoading ? '-' : recentlyCreated} detail="Tạo trong 30 ngày gần nhất" />
      </div>

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-theme bg-rose-500/10 p-4 text-sm text-rose-200">
          <span>{error}</span>
          <button type="button" className="font-semibold hover:underline" onClick={() => void loadManagers()}>
            Thử lại
          </button>
        </div>
      )}

      {isLoading ? (
        <div className="liquid-glass-card rounded-lg p-4 text-sm text-muted">Đang tải danh sách manager...</div>
      ) : filteredManagers.length === 0 ? (
        <div className="liquid-glass-card rounded-lg p-4 text-sm text-muted">Không có manager phù hợp.</div>
      ) : (
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Danh sách manager</p>
              <h2 className="mt-1 text-base font-semibold text-fg">Tài khoản quản lý</h2>
            </div>
            <span className="rounded-full border border-theme px-3 py-1 text-xs font-semibold text-subtle">
              {filteredManagers.length} manager
            </span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {filteredManagers.map((manager) => (
              <article key={manager._id} className="rounded-lg border border-theme bg-badge p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-fg">{manager.fullName}</p>
                    <p className="mt-1 truncate text-xs text-subtle">{manager.email}</p>
                  </div>
                  <AdminStatusBadge status={manager.isActive ? 'active' : 'inactive'} />
                </div>

                <dl className="mt-5 grid gap-3 text-sm">
                  <div>
                    <dt className="text-subtle">Điện thoại</dt>
                    <dd className="mt-1 font-medium text-fg">{manager.phone ?? '-'}</dd>
                  </div>
                  <div>
                    <dt className="text-subtle">Ngày tạo</dt>
                    <dd className="mt-1 font-medium text-fg">
                      {manager.createdAt ? new Date(manager.createdAt).toLocaleDateString('vi-VN') : '-'}
                    </dd>
                  </div>
                </dl>

                <button
                  type="button"
                  disabled={updatingId === manager._id}
                  onClick={() => void handleToggleStatus(manager)}
                  className="mt-5 h-10 w-full rounded-lg border border-theme px-4 text-sm font-semibold text-fg transition hover:bg-ghost disabled:cursor-not-allowed disabled:opacity-50"
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
