export type VisitorType = 'walkIn' | 'user'
export type TicketStatus = 'active' | 'completed'

export type ParkingTicket = {
  id: string
  plate: string
  visitorType: VisitorType
  vehicleType: 'Motorbike'
  slot: string
  zone: string
  checkInAt: string
  checkOutAt?: string
  status: TicketStatus
  note?: string
}

export const visitorTypeLabel: Record<VisitorType, string> = {
  walkIn: 'Khách vãng lai',
  user: 'Người dùng',
}

export function formatGateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function formatStaffCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')} VND`
}
