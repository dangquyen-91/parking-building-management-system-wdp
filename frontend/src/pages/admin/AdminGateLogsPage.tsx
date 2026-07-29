import { useEffect, useMemo, useState } from 'react'
import {
  AdminGateLogFilters,
  AdminGateLogList,
  AdminGateLogStats,
  AdminPageShell,
  type AdminGateCustomerFilter,
  type AdminGateVehicleFilter,
} from '../../components/admin'
import { adminApi, type AdminDashboardReport } from '../../services/adminApi'
import type { GateSession } from '../../services/staffGateApi'
import { Button } from '../../components/ui/button'
import { Alert, AlertDescription } from '../../components/ui/alert'

export function AdminGateLogsPage() {
  const [sessions, setSessions] = useState<GateSession[]>([])
  const [dashboard, setDashboard] = useState<AdminDashboardReport | null>(null)
  const [query, setQuery] = useState('')
  const [vehicleFilter, setVehicleFilter] =
    useState<AdminGateVehicleFilter>('all')
  const [customerFilter, setCustomerFilter] =
    useState<AdminGateCustomerFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadGateLogs() {
    setIsLoading(true)
    setError(null)

    try {
      const [sessionsResponse, dashboardResponse] = await Promise.all([
        adminApi.getSessions({ limit: 100 }),
        adminApi.getDashboardReport(),
      ])
      setSessions(sessionsResponse.sessions ?? [])
      setDashboard(dashboardResponse)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Không thể tải dữ liệu hoạt động cổng.',
      )
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadGateLogs(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toUpperCase().replace(/\s/g, '')

    return sessions.filter((session) => {
      if (normalizedQuery && !session.licensePlate.includes(normalizedQuery))
        return false
      if (vehicleFilter !== 'all' && session.vehicleType !== vehicleFilter)
        return false
      if (customerFilter !== 'all' && session.customerType !== customerFilter)
        return false
      return true
    })
  }, [customerFilter, query, sessions, vehicleFilter])

  return (
    <AdminPageShell
      eyebrow="Admin // Hoạt động cổng"
      title="Giám sát xe vào / ra"
      description="Theo dõi xe đang trong bãi, nhân viên ghi nhận, vị trí đỗ và thống kê hoạt động cổng hôm nay."
      actions={
        <AdminGateLogFilters
          query={query}
          vehicleFilter={vehicleFilter}
          customerFilter={customerFilter}
          onQueryChange={setQuery}
          onVehicleFilterChange={setVehicleFilter}
          onCustomerFilterChange={setCustomerFilter}
        />
      }
    >
      <AdminGateLogStats dashboard={dashboard} isLoading={isLoading} />

      {error && (
        <Alert
          variant="destructive"
          className="mb-5 flex items-center justify-between"
        >
          <AlertDescription>{error}</AlertDescription>
          <Button
            type="button"
            variant="link"
            className="h-auto p-0"
            onClick={() => void loadGateLogs()}
          >
            Thử lại
          </Button>
        </Alert>
      )}

      <Alert className="mb-5">
        <AlertDescription>
          Danh sách chi tiết hiện hiển thị các xe đang trong bãi. Số lượt xe ra
          hôm nay được tổng hợp từ báo cáo hệ thống.
        </AlertDescription>
      </Alert>

      <AdminGateLogList sessions={filteredSessions} isLoading={isLoading} />
    </AdminPageShell>
  )
}
