import { useEffect, useMemo, useState } from 'react'
import {
  ManagerStaffFilters,
  ManagerStaffList,
  ManagerStaffStats,
  type ManagerStaffStatusFilter,
} from '../../components/manager'
import { AdminPageShell } from '../../components/admin'
import { adminApi, type AdminUser } from '../../services/adminApi'
import type { ManagerStaffUser } from '../../services/managerStaffApi'
import type { GateSession } from '../../services/staffGateApi'

export function AdminStaffPage() {
  const [staff, setStaff] = useState<AdminUser[]>([])
  const [sessions, setSessions] = useState<GateSession[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ManagerStaffStatusFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadStaffData() {
    setIsLoading(true)
    setError(null)

    try {
      const [staffResponse, sessionsResponse] = await Promise.all([
        adminApi.getUsers({ role: 'staff', limit: 100, sort: 'fullName', order: 'asc' }),
        adminApi.getSessions({ limit: 100 }),
      ])
      setStaff(staffResponse.users ?? [])
      setSessions(sessionsResponse.sessions ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu nhân viên.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadStaffData(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  const filteredStaff = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return staff.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        user.fullName.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        user.phone?.toLowerCase().includes(normalizedQuery)

      if (!matchesQuery) return false
      if (statusFilter !== 'all' && user.isActive !== (statusFilter === 'active')) return false
      return true
    })
  }, [query, staff, statusFilter])

  return (
    <AdminPageShell
      eyebrow="Admin // Nhân viên"
      title="Quản lý nhân viên"
      description="Theo dõi tài khoản staff, thông tin liên hệ và số xe đang được từng nhân viên ghi nhận tại cổng."
      actions={
        <ManagerStaffFilters
          query={query}
          statusFilter={statusFilter}
          onQueryChange={setQuery}
          onStatusFilterChange={setStatusFilter}
        />
      }
    >
      <ManagerStaffStats staff={staff as ManagerStaffUser[]} sessions={sessions} isLoading={isLoading} />

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-theme bg-rose-500/10 p-4 text-sm text-rose-200">
          <span>{error}</span>
          <button type="button" className="font-semibold hover:underline" onClick={() => void loadStaffData()}>
            Thử lại
          </button>
        </div>
      )}

      <div className="mb-4 rounded-lg border border-theme bg-badge px-4 py-3 text-xs text-muted">
        Admin có thể theo dõi nhân viên tại đây. Việc chỉnh vai trò, khóa hoặc mở tài khoản nằm ở trang Người dùng.
      </div>

      <ManagerStaffList staff={filteredStaff as ManagerStaffUser[]} sessions={sessions} isLoading={isLoading} />
    </AdminPageShell>
  )
}
