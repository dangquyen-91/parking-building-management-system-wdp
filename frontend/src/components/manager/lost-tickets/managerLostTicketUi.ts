import type { ManagerIncident, ManagerIncidentUser } from '../../../services/managerIncidentsApi'
import type { GateVehicleType } from '../../../services/staffGateApi'

export const LOST_TICKET_VEHICLE_LABELS: Record<GateVehicleType, string> = {
  motorcycle: 'Xe máy',
  car: 'Ô tô',
}

export function formatLostTicketCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')} VND`
}

export function formatLostTicketDateTime(value?: string) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function getIncidentStaffName(value?: ManagerIncidentUser | string | null) {
  if (!value || typeof value === 'string') return 'Không xác định'
  return value.fullName ?? value.email ?? 'Không xác định'
}

export function getIncidentSession(incident: ManagerIncident) {
  return incident.sessionId && typeof incident.sessionId !== 'string' ? incident.sessionId : undefined
}

export function getIncidentVehicleType(incident: ManagerIncident) {
  const session = getIncidentSession(incident)
  return incident.vehicleType ?? session?.vehicleType
}


