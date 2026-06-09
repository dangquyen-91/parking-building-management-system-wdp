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
        if (!ignore) setError(loadError instanceof Error ? loadError.message : 'Cannot load staff accounts')
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
      eyebrow="Admin // Staff"
      title="Staff Monitoring"
      description="Admin xem danh sach tai khoan staff ma manager van hanh trong quy trinh cong."
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Staff accounts" value={isLoading ? '-' : total} detail="Role staff" />
        <AdminStatCard label="Active" value={isLoading ? '-' : activeStaff} detail="Can access staff workspace" />
        <AdminStatCard label="Inactive" value={isLoading ? '-' : total - activeStaff} detail="Access disabled" />
      </div>

      <section className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {isLoading && <p className="rounded-lg border border-theme bg-badge p-4 text-sm text-muted">Loading staff...</p>}
        {!isLoading && staff.length === 0 && (
          <p className="rounded-lg border border-theme bg-badge p-4 text-sm text-muted">No staff accounts found.</p>
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
                <dt className="text-subtle">Phone</dt>
                <dd className="mt-1 font-medium text-fg">{user.phone ?? '-'}</dd>
              </div>
              <div>
                <dt className="text-subtle">Created</dt>
                <dd className="mt-1 font-medium text-fg">{user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : '-'}</dd>
              </div>
            </dl>
          </article>
        ))}
      </section>
    </AdminPageShell>
  )
}
