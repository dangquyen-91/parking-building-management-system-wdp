import { Button } from '@/components/ui/button'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ManagerGateLogFilters,
  ManagerGateLogList,
  ManagerGateLogStats,
  ManagerPageHeader,
  type ManagerGateCustomerFilter,
  type ManagerGateStatusFilter,
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
  const [statusFilter, setStatusFilter] = useState<ManagerGateStatusFilter>('active')
  const [vehicleFilter, setVehicleFilter] = useState<ManagerGateVehicleFilter>('all')
  const [customerFilter, setCustomerFilter] = useState<ManagerGateCustomerFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadGateLogs = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const sessionsRequest =
        statusFilter === 'all'
          ? Promise.all([
              managerGateLogsApi.getActiveSessions({ status: 'active', limit: 100 }),
              managerGateLogsApi.getActiveSessions({ status: 'completed', limit: 100 }),
              managerGateLogsApi.getActiveSessions({ status: 'cancelled', limit: 100 }),
            ]).then((responses) => {
              const uniqueSessions = new Map<string, GateSession>()

              responses.forEach((response) => {
                response.sessions.forEach((session) => uniqueSessions.set(session._id, session))
              })

              const mergedSessions = Array.from(uniqueSessions.values()).sort(
                (a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime(),
              )

              return {
                sessions: mergedSessions,
                total: responses.reduce((sum, response) => sum + response.total, 0),
              }
            })
          : managerGateLogsApi.getActiveSessions({ status: statusFilter, limit: 100 })

      const [sessionsResponse, dashboardResponse] = await Promise.all([
        sessionsRequest,
        managerGateLogsApi.getDashboard(),
      ])
      setSessions(sessionsResponse.sessions ?? [])
      setDashboard(dashboardResponse)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu hoạt động cổng.')
    } finally {
      setIsLoading(false)
    }
  }, [statusFilter])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadGateLogs(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadGateLogs])

  const filteredSessions = useMemo(() => {
    const normalizedQuery = normalizePlateSearch(query)

    return sessions.filter((session) => {
      if (normalizedQuery && !normalizePlateSearch(session.licensePlate).includes(normalizedQuery)) return false
      if (vehicleFilter !== 'all' && session.vehicleType !== vehicleFilter) return false
      if (customerFilter !== 'all' && session.customerType !== customerFilter) return false
      return true
    })
  }, [customerFilter, query, sessions, vehicleFilter])

  const isFiltered =
    statusFilter !== 'active' || Boolean(query.trim()) || vehicleFilter !== 'all' || customerFilter !== 'all'

  return (
    <div className="relative mx-auto max-w-[118rem] p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Quản lý // Hoạt động cổng"
        title="Giám sát xe vào / ra"
        description="Theo dõi xe đang trong bãi, lịch sử xe đã ra, nhân viên ghi nhận và vị trí đỗ."
        actions={
          <ManagerGateLogFilters
            query={query}
            statusFilter={statusFilter}
            vehicleFilter={vehicleFilter}
            customerFilter={customerFilter}
            onQueryChange={setQuery}
            onStatusFilterChange={setStatusFilter}
            onVehicleFilterChange={setVehicleFilter}
            onCustomerFilterChange={setCustomerFilter}
          />
        }
      />

      <ManagerGateLogStats
        dashboard={dashboard}
        sessions={filteredSessions}
        totalSessions={sessions.length}
        statusFilter={statusFilter}
        isFiltered={isFiltered}
        isLoading={isLoading}
      />

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-border bg-rose-500/10 p-4 text-sm text-rose-200">
          <span>{error}</span>
          <Button type="button" className="font-semibold hover:underline" onClick={() => void loadGateLogs()}>
            Thử lại
          </Button>
        </div>
      )}

      <ManagerGateLogList sessions={filteredSessions} isLoading={isLoading} />
    </div>
  )
}



