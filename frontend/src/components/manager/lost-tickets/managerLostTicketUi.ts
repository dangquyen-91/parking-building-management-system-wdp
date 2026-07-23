import type { ManagerIncident, ManagerIncidentUser } from '../../../services/managerIncidentsApi'
import type { GateVehicleType } from '../../../services/staffGateApi'

export const LOST_TICKET_VEHICLE_LABELS: Record<GateVehicleType, string> = {
  motorcycle: 'Xe máy',
  car: 'Ô tô',
}

export type ManagerLostTicketStatus = 'pending' | 'completed' | 'recorded'

export const LOST_TICKET_STATUS_LABELS: Record<ManagerLostTicketStatus, string> = {
  pending: 'Chờ thanh toán',
  completed: 'Đã xử lý',
  recorded: 'Đã ghi nhận',
}

export const LOST_TICKET_STATUS_TONES: Record<ManagerLostTicketStatus, string> = {
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  completed: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  recorded: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
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

export function getLostTicketStatus(incident: ManagerIncident): ManagerLostTicketStatus {
  const session = getIncidentSession(incident)
  if (!session) return 'recorded'
  return session.exitTime ? 'completed' : 'pending'
}


