import { useEffect, useMemo, useState } from 'react'
import {
  ManagerLostTicketFilters,
  ManagerLostTicketList,
  ManagerLostTicketStats,
  ManagerPageHeader,
  type ManagerLostTicketVehicleFilter,
} from '../../components/manager'
import { managerIncidentsApi, type ManagerIncident } from '../../services/managerIncidentsApi'

function normalizePlateSearch(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

function getIncidentVehicleType(incident: ManagerIncident) {
  if (incident.vehicleType) return incident.vehicleType
  return incident.sessionId && typeof incident.sessionId !== 'string' ? incident.sessionId.vehicleType : undefined
}

export function ManagerLostTicketsPage() {
  const [incidents, setIncidents] = useState<ManagerIncident[]>([])
  const [total, setTotal] = useState(0)
  const [query, setQuery] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState<ManagerLostTicketVehicleFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadLostTickets() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await managerIncidentsApi.getLostTickets({
        limit: 100,
        licensePlate: query.trim() || undefined,
      })
      setIncidents(response.incidents ?? [])
      setTotal(response.total ?? 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không tải được danh sách mất vé.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadLostTickets(), 250)
    return () => window.clearTimeout(timeoutId)
  }, [query])

  const filteredIncidents = useMemo(() => {
    const normalizedQuery = normalizePlateSearch(query)

    return incidents.filter((incident) => {
      if (normalizedQuery && !normalizePlateSearch(incident.licensePlate).includes(normalizedQuery)) return false
      if (vehicleFilter !== 'all' && getIncidentVehicleType(incident) !== vehicleFilter) return false
      return true
    })
  }, [incidents, query, vehicleFilter])

  return (
    <div className="relative mx-auto max-w-[118rem] p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Quản lý // Mất vé"
        title="Quản lý mất vé"
        description="Theo dõi các ca khách mất vé hoặc mất QR đã được staff xử lý, bao gồm phí phạt, biển số và nhân viên ghi nhận."
        actions={
          <ManagerLostTicketFilters
            query={query}
            vehicleFilter={vehicleFilter}
            onQueryChange={setQuery}
            onVehicleFilterChange={setVehicleFilter}
          />
        }
      />

      <ManagerLostTicketStats incidents={filteredIncidents} total={total} isLoading={isLoading} />

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-2xl border border-rose-400/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-100">
          <span>{error}</span>
          <button type="button" className="font-semibold hover:underline" onClick={() => void loadLostTickets()}>
            Thử lại
          </button>
        </div>
      )}

      <div className="mb-4 rounded-2xl border border-theme bg-badge px-4 py-3 text-xs text-muted">
        Danh sách này lấy từ các sự cố <b className="text-fg">lost_qr</b> do staff tạo khi xử lý mất vé. Manager chỉ kiểm tra và đối soát, không tạo trực tiếp tại đây.
      </div>

      <ManagerLostTicketList incidents={filteredIncidents} isLoading={isLoading} />
    </div>
  )
}
