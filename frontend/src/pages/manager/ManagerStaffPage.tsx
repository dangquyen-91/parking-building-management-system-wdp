import { useEffect, useMemo, useState } from 'react'
import {
  ManagerPageHeader,
  ManagerStaffFilters,
  ManagerStaffList,
  ManagerStaffStats,
  type ManagerStaffStatusFilter,
} from '../../components/manager'
import { managerStaffApi, type ManagerStaffUser } from '../../services/managerStaffApi'
import type { GateSession } from '../../services/staffGateApi'

export function ManagerStaffPage() {
  const [staff, setStaff] = useState<ManagerStaffUser[]>([])
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
        managerStaffApi.getStaff(),
        managerStaffApi.getActiveSessions(),
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
    <div className="p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Quản lý // Nhân viên"
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
      />

      <ManagerStaffStats staff={staff} sessions={sessions} isLoading={isLoading} />

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-theme bg-rose-500/10 p-4 text-sm text-rose-200">
          <span>{error}</span>
          <button type="button" className="font-semibold hover:underline" onClick={() => void loadStaffData()}>
            Thử lại
          </button>
        </div>
      )}

      <div className="mb-4 rounded-lg border border-theme bg-badge px-4 py-3 text-xs text-muted">
        Manager có quyền theo dõi nhân viên. Việc sửa thông tin, đổi vai trò hoặc khóa tài khoản hiện thuộc quyền Admin.
      </div>

      <ManagerStaffList staff={filteredStaff} sessions={sessions} isLoading={isLoading} />
    </div>
  )
}
