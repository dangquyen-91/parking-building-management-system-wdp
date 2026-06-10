import { useEffect, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge } from '../components/admin'
import { adminApi, type AdminUser } from '../services/adminApi'

export function AdminStaffPage() {
  const [staff, setStaff] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadStaff() {
      try {
        setIsLoading(true)
        setError('')
        const response = await adminApi.getUsers({ role: 'staff', limit: 100, sort: 'fullName', order: 'asc' })
        if (!ignore) {
          setStaff(response.users)
          setTotal(response.total)
        }
      } catch (loadError) {
        if (!ignore) setError(loadError instanceof Error ? loadError.message : 'Không thể tải tài khoản nhân viên')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadStaff()

    return () => {
      ignore = true
    }
  }, [])

  const activeStaff = staff.filter((user) => user.isActive).length

  return (
    <AdminPageShell
      eyebrow="Admin // Nhân viên"
      title="Theo dõi nhân viên"
      description="Admin xem danh sách tài khoản nhân viên mà quản lý vận hành trong quy trình cổng."
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Tài khoản nhân viên" value={isLoading ? '-' : total} detail="Vai trò nhân viên" />
        <AdminStatCard label="Đang hoạt động" value={isLoading ? '-' : activeStaff} detail="Có thể truy cập khu nhân viên" />
        <AdminStatCard label="Ngưng hoạt động" value={isLoading ? '-' : total - activeStaff} detail="Đã tắt quyền truy cập" />
      </div>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading && <p className="rounded-lg border border-theme bg-badge p-4 text-sm text-muted">Đang tải nhân viên...</p>}
        {!isLoading && staff.length === 0 && (
          <p className="rounded-lg border border-theme bg-badge p-4 text-sm text-muted">Không tìm thấy tài khoản nhân viên.</p>
        )}
        {!isLoading && staff.map((user) => (
          <article key={user._id} className="liquid-glass-card rounded-lg p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-lg font-semibold text-fg">{user.fullName}</p>
                <p className="mt-1 text-xs text-subtle">{user.email}</p>
              </div>
              <AdminStatusBadge status={user.isActive ? 'active' : 'inactive'} />
            </div>
            <dl className="mt-5 grid gap-3 text-sm">
              <div>
                <dt className="text-subtle">Điện thoại</dt>
                <dd className="mt-1 font-medium text-fg">{user.phone ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-subtle">Ngày tạo</dt>
                <dd className="mt-1 font-medium text-fg">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </AdminPageShell>
  )
}
