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

export function AdminGateLogsPage() {
  const [sessions, setSessions] = useState<GateSession[]>([])
  const [dashboard, setDashboard] = useState<AdminDashboardReport | null>(null)
  const [query, setQuery] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState<AdminGateVehicleFilter>('all')
  const [customerFilter, setCustomerFilter] = useState<AdminGateCustomerFilter>('all')
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
    const normalizedQuery = query.trim().toUpperCase().replace(/\s/g, '')

    return sessions.filter((session) => {
      if (normalizedQuery && !session.licensePlate.includes(normalizedQuery)) return false
      if (vehicleFilter !== 'all' && session.vehicleType !== vehicleFilter) return false
      if (customerFilter !== 'all' && session.customerType !== customerFilter) return false
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
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-200">
          <span>{error}</span>
          <button type="button" className="font-semibold hover:underline" onClick={() => void loadGateLogs()}>
            Thử lại
          </button>
        </div>
      )}

      <div className="mb-5 flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-xs leading-5 text-emerald-800 dark:text-emerald-200">
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-xs font-black text-white">●</span>
        <span>Danh sách chi tiết hiện hiển thị các xe đang trong bãi. Số lượt xe ra hôm nay được tổng hợp từ báo cáo hệ thống.</span>
      </div>

      <AdminGateLogList sessions={filteredSessions} isLoading={isLoading} />
    </AdminPageShell>
  )
}
