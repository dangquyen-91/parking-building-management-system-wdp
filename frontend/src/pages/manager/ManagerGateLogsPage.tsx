import { useEffect, useMemo, useState } from 'react'
import {
  ManagerGateLogFilters,
  ManagerGateLogList,
  ManagerGateLogStats,
  ManagerPageHeader,
  type ManagerGateCustomerFilter,
  type ManagerGateVehicleFilter,
} from '../../components/manager'
import { managerGateLogsApi, type ManagerGateDashboard } from '../../services/managerGateLogsApi'
import type { GateSession } from '../../services/staffGateApi'

function normalizePlateSearch(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function ManagerGateLogsPage() {
  const [sessions, setSessions] = useState<GateSession[]>([])
  const [dashboard, setDashboard] = useState<ManagerGateDashboard | null>(null)
  const [query, setQuery] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState<ManagerGateVehicleFilter>('all')
  const [customerFilter, setCustomerFilter] = useState<ManagerGateCustomerFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadGateLogs() {
    setIsLoading(true)
    setError(null)

    try {
      const [sessionsResponse, dashboardResponse] = await Promise.all([
        managerGateLogsApi.getActiveSessions({ limit: 100 }),
        managerGateLogsApi.getDashboard(),
      ])
      setSessions(sessionsResponse.sessions ?? [])
      setDashboard(dashboardResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu hoạt động cổng.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadGateLogs(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  const filteredSessions = useMemo(() => {
    const normalizedQuery = normalizePlateSearch(query)

    return sessions.filter((session) => {
      if (normalizedQuery && !normalizePlateSearch(session.licensePlate).includes(normalizedQuery)) return false
      if (vehicleFilter !== 'all' && session.vehicleType !== vehicleFilter) return false
      if (customerFilter !== 'all' && session.customerType !== customerFilter) return false
      return true
    })
  }, [customerFilter, query, sessions, vehicleFilter])
  const isFiltered = Boolean(query.trim()) || vehicleFilter !== 'all' || customerFilter !== 'all'

  return (
    <div className="relative mx-auto max-w-[118rem] p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Quản lý // Hoạt động cổng"
        title="Giám sát xe vào / ra"
        description="Theo dõi xe đang trong bãi, nhân viên ghi nhận, vị trí đỗ và thống kê hoạt động cổng hôm nay."
        actions={
          <ManagerGateLogFilters
            query={query}
            vehicleFilter={vehicleFilter}
            customerFilter={customerFilter}
            onQueryChange={setQuery}
            onVehicleFilterChange={setVehicleFilter}
            onCustomerFilterChange={setCustomerFilter}
          />
        }
      />

      <ManagerGateLogStats
        dashboard={dashboard}
        sessions={filteredSessions}
        totalSessions={sessions.length}
        isFiltered={isFiltered}
        isLoading={isLoading}
      />

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-theme bg-rose-500/10 p-4 text-sm text-rose-200">
          <span>{error}</span>
          <button type="button" className="font-semibold hover:underline" onClick={() => void loadGateLogs()}>
            Thử lại
          </button>
        </div>
      )}

      <div className="mb-4 rounded-lg border border-theme bg-badge px-4 py-3 text-xs text-muted">
        Danh sách chi tiết hiện hiển thị các xe đang trong bãi. Số lượt xe ra hôm nay được tổng hợp từ báo cáo hệ thống.
      </div>

      <ManagerGateLogList sessions={filteredSessions} isLoading={isLoading} />
    </div>
  )
}
