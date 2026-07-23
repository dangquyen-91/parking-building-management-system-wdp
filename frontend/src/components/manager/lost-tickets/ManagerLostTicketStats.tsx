import { ManagerStatCard } from '../common/ManagerStatCard'
import type { ManagerIncident } from '../../../services/managerIncidentsApi'
import { formatLostTicketCurrency, getIncidentVehicleType } from './managerLostTicketUi'

type ManagerLostTicketStatsProps = {
  incidents: ManagerIncident[]
  total: number
  isLoading: boolean
}

export function ManagerLostTicketStats({ incidents, total, isLoading }: ManagerLostTicketStatsProps) {
  const motorcycleCount = incidents.filter((incident) => getIncidentVehicleType(incident) === 'motorcycle').length
  const carCount = incidents.filter((incident) => getIncidentVehicleType(incident) === 'car').length
  const fineTotal = incidents.reduce((sum, incident) => sum + (incident.fineAmount || 0), 0)

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ManagerStatCard
        label="Tổng mất vé"
        value={isLoading ? '-' : total}
        detail="Sự cố mất QR/vé đã ghi nhận"
        tone="amber"
      />
      <ManagerStatCard
        label="Xe máy"
        value={isLoading ? '-' : motorcycleCount}
        detail="Theo kết quả đang hiển thị"
        tone="sky"
      />
      <ManagerStatCard
        label="Ô tô"
        value={isLoading ? '-' : carCount}
        detail="Theo kết quả đang hiển thị"
        tone="violet"
      />
      <ManagerStatCard
        label="Tổng phí phạt"
        value={isLoading ? '-' : formatLostTicketCurrency(fineTotal)}
        detail="Tính trên danh sách đang hiển thị"
        tone="emerald"
      />
    </div>
  )
}


