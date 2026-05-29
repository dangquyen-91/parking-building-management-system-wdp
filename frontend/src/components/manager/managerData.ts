export type SlotStatus = 'available' | 'occupied' | 'reserved' | 'maintenance'
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled'
export type GateLogStatus = 'checkin' | 'checkout'

export type ManagerZone = {
  id: string
  floor: string
  zone: string
  vehicleType: string
  total: number
  occupied: number
  reserved: number
  maintenance: number
}

export type ManagerBooking = {
  id: string
  customer: string
  plate: string
  slot: string
  schedule: string
  status: BookingStatus
}

export type ManagerGateLog = {
  id: string
  plate: string
  visitorType: string
  staff: string
  action: GateLogStatus
  time: string
  fee: number
}

export type ManagerStaff = {
  id: string
  name: string
  shift: string
  gate: string
  checkins: number
  checkouts: number
  status: 'online' | 'break' | 'offline'
}

export const MANAGER_ZONES: ManagerZone[] = [
  { id: 'b1-a', floor: 'B1', zone: 'Zone A', vehicleType: 'Motorbike', total: 40, occupied: 22, reserved: 4, maintenance: 1 },
  { id: 'b1-b', floor: 'B1', zone: 'Zone B', vehicleType: 'Motorbike', total: 32, occupied: 18, reserved: 2, maintenance: 0 },
  { id: 'b2-a', floor: 'B2', zone: 'Zone A', vehicleType: 'Car', total: 46, occupied: 29, reserved: 8, maintenance: 2 },
  { id: 'b2-ev', floor: 'B2', zone: 'EV Bay', vehicleType: 'EV', total: 18, occupied: 9, reserved: 5, maintenance: 1 },
]

export const MANAGER_BOOKINGS: ManagerBooking[] = [
  { id: 'BK-2041', customer: 'Nguyen Minh Anh', plate: '51G-882.14', slot: 'B2-A-18', schedule: 'Today 09:00 - 12:00', status: 'confirmed' },
  { id: 'BK-2042', customer: 'Tran Hoang Nam', plate: '59X2-481.22', slot: 'B1-A-08', schedule: 'Today 13:00 - 18:00', status: 'pending' },
  { id: 'BK-2043', customer: 'Le Gia Huy', plate: '60A-119.77', slot: 'B2-EV-04', schedule: 'Tomorrow 08:00 - 17:00', status: 'confirmed' },
  { id: 'BK-2038', customer: 'Pham Thu Ha', plate: '51K7-902.16', slot: 'B1-B-07', schedule: 'Yesterday 16:00 - 18:00', status: 'cancelled' },
]

export const MANAGER_GATE_LOGS: ManagerGateLog[] = [
  { id: 'GL-9007', plate: '59X2-481.22', visitorType: 'Khach vang lai', staff: 'Bao Tran', action: 'checkin', time: '10:42', fee: 0 },
  { id: 'GL-9006', plate: '51K7-902.16', visitorType: 'User', staff: 'Linh Pham', action: 'checkout', time: '10:28', fee: 11000 },
  { id: 'GL-9005', plate: '60B1-118.45', visitorType: 'Khach vang lai', staff: 'Bao Tran', action: 'checkout', time: '09:55', fee: 8000 },
  { id: 'GL-9004', plate: '72C1-330.21', visitorType: 'User', staff: 'Minh Le', action: 'checkin', time: '09:20', fee: 0 },
]

export const MANAGER_STAFF: ManagerStaff[] = [
  { id: 'ST-01', name: 'Bao Tran', shift: '06:00 - 14:00', gate: 'Gate A', checkins: 36, checkouts: 21, status: 'online' },
  { id: 'ST-02', name: 'Linh Pham', shift: '06:00 - 14:00', gate: 'Gate B', checkins: 28, checkouts: 25, status: 'online' },
  { id: 'ST-03', name: 'Minh Le', shift: '14:00 - 22:00', gate: 'Gate A', checkins: 12, checkouts: 9, status: 'break' },
  { id: 'ST-04', name: 'Quyen Do', shift: '22:00 - 06:00', gate: 'Gate B', checkins: 0, checkouts: 0, status: 'offline' },
]

export const statusTone: Record<SlotStatus | BookingStatus | GateLogStatus | ManagerStaff['status'], string> = {
  available: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  occupied: 'border-sky-400/40 bg-sky-500/10 text-sky-200',
  reserved: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
  maintenance: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
  confirmed: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  pending: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
  cancelled: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
  checkin: 'border-sky-400/40 bg-sky-500/10 text-sky-200',
  checkout: 'border-violet-400/40 bg-violet-500/10 text-violet-100',
  online: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  break: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
  offline: 'border-theme bg-badge text-subtle',
}

export function getAvailableSlots(zone: ManagerZone) {
  return zone.total - zone.occupied - zone.reserved - zone.maintenance
}

export function formatCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')} VND`
}

