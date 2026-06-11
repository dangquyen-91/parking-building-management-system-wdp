export type VisitorType = 'walkIn' | 'user'
export type GateMode = 'checkin' | 'checkout'
export type TicketStatus = 'active' | 'completed'
export type IncidentStatus = 'open' | 'reviewing' | 'resolved'

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

export type StaffIncident = {
  id: string
  title: string
  plate: string
  category: string
  reportedAt: string
  status: IncidentStatus
  note: string
}

export const STAFF_ZONES = [
  { id: 'M-B1-A', label: 'B1 - Khu A', available: 18, total: 40 },
  { id: 'M-B1-B', label: 'B1 - Khu B', available: 11, total: 32 },
  { id: 'M-B2-A', label: 'B2 - Khu A', available: 24, total: 46 },
] as const

export const INITIAL_TICKETS: ParkingTicket[] = [
  {
    id: 'PK-MOTO-1024',
    plate: '59X2-481.22',
    visitorType: 'walkIn',
    vehicleType: 'Motorbike',
    slot: 'B1-A-18',
    zone: 'B1 - Khu A',
    checkInAt: '2026-05-28T08:12:00',
    status: 'active',
    note: 'Khách vãng lai gửi trong ngày',
  },
  {
    id: 'PK-MOTO-1025',
    plate: '51K7-902.16',
    visitorType: 'user',
    vehicleType: 'Motorbike',
    slot: 'B1-B-07',
    zone: 'B1 - Khu B',
    checkInAt: '2026-05-28T09:35:00',
    status: 'active',
    note: 'Người dùng đã có tài khoản',
  },
  {
    id: 'PK-MOTO-1021',
    plate: '60B1-118.45',
    visitorType: 'walkIn',
    vehicleType: 'Motorbike',
    slot: 'B2-A-11',
    zone: 'B2 - Khu A',
    checkInAt: '2026-05-27T17:20:00',
    checkOutAt: '2026-05-27T20:05:00',
    status: 'completed',
  },
]

export const STAFF_INCIDENTS: StaffIncident[] = [
  {
    id: 'INC-301',
    title: 'Khách báo mất vé xe',
    plate: '59X2-481.22',
    category: 'Mất vé',
    reportedAt: '2026-05-28T10:20:00',
    status: 'open',
    note: 'Đã đối chiếu biển số và giờ vào, chờ quản lý xác nhận.',
  },
  {
    id: 'INC-302',
    title: 'Sai biển số khi ghi nhận xe vào',
    plate: '51K7-902.16',
    category: 'Sửa biển số',
    reportedAt: '2026-05-28T09:48:00',
    status: 'reviewing',
    note: 'Cần sửa từ 51K7-902.61 thành 51K7-902.16.',
  },
  {
    id: 'INC-298',
    title: 'Khu B2-A tạm khóa 1 vị trí',
    plate: 'N/A',
    category: 'Bảo trì',
    reportedAt: '2026-05-27T18:05:00',
    status: 'resolved',
    note: 'Đã gắn biển báo và mở lại sau khi vệ sinh sàn.',
  },
]

export const visitorTypeLabel: Record<VisitorType, string> = {
  walkIn: 'Khách vãng lai',
  user: 'Người dùng',
}

export const incidentStatusLabel: Record<IncidentStatus, string> = {
  open: 'Đang mở',
  reviewing: 'Đang xem xét',
  resolved: 'Đã xử lý',
}

export const incidentStatusClass: Record<IncidentStatus, string> = {
  open: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
  reviewing: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
  resolved: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
}

export function formatGateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

export function calculateMotorbikeFee(checkInAt: string, checkOutAt = new Date().toISOString()) {
  const durationMs = Math.max(0, new Date(checkOutAt).getTime() - new Date(checkInAt).getTime())
  const hours = Math.max(1, Math.ceil(durationMs / 3_600_000))
  const fee = Math.min(30000, 5000 + Math.max(0, hours - 1) * 3000)

  return { hours, fee }
}

export function formatStaffCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')} VND`
}
