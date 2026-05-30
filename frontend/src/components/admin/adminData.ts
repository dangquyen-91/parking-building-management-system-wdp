export type AdminStatus =
  | 'active'
  | 'pending'
  | 'locked'
  | 'enabled'
  | 'warning'
  | 'critical'
  | 'empty'
  | 'available'
  | 'full'
  | 'occupied'
  | 'reserved'
  | 'maintenance'
  | 'active-session'
  | 'completed'
  | 'confirmed'
  | 'cancelled'

export type AdminUser = {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Manager' | 'Staff' | 'User'
  area: string
  lastSeen: string
  status: Extract<AdminStatus, 'active' | 'pending' | 'locked'>
}

export type AdminRole = {
  name: AdminUser['role']
  users: number
  scope: string
  permissions: string[]
}

export type AdminAuditLog = {
  id: string
  actor: string
  action: string
  target: string
  time: string
  status: Extract<AdminStatus, 'enabled' | 'warning' | 'critical'>
}

export type AdminControl = {
  title: string
  detail: string
  owner: string
  status: Extract<AdminStatus, 'enabled' | 'warning'>
}

export type AdminFloor = {
  id: string
  building: string
  floor: string
  zones: number
  totalSlots: number
  occupiedSlots: number
  manager: string
  status: Extract<AdminStatus, 'enabled' | 'maintenance' | 'warning'>
}

export type AdminSlot = {
  id: string
  code: string
  building: string
  floor: string
  zone: string
  vehicleType: 'Car' | 'Motorbike' | 'EV'
  bookingId: string
  status: Extract<AdminStatus, 'available' | 'occupied' | 'reserved' | 'maintenance'>
}

export type AdminBooking = {
  id: string
  customer: string
  plate: string
  slot: string
  building: string
  schedule: string
  amount: number
  payment: 'Paid' | 'Unpaid' | 'Refunded'
  status: Extract<AdminStatus, 'confirmed' | 'pending' | 'cancelled'>
}

export const ADMIN_USERS: AdminUser[] = [
  {
    id: 'USR-1001',
    name: 'Nguyen Minh Anh',
    email: 'minhanh@example.com',
    role: 'User',
    area: 'Tower A',
    lastSeen: 'Today 10:20',
    status: 'active',
  },
  {
    id: 'USR-1002',
    name: 'Tran Hoang Nam',
    email: 'nam.manager@example.com',
    role: 'Manager',
    area: 'Building Operations',
    lastSeen: 'Today 09:48',
    status: 'active',
  },
  {
    id: 'USR-1003',
    name: 'Bao Tran',
    email: 'bao.staff@example.com',
    role: 'Staff',
    area: 'Gate A',
    lastSeen: 'Today 10:42',
    status: 'active',
  },
  {
    id: 'USR-1004',
    name: 'Le Gia Huy',
    email: 'huy@example.com',
    role: 'User',
    area: 'Tower B',
    lastSeen: 'Pending invite',
    status: 'pending',
  },
  {
    id: 'USR-1005',
    name: 'Pham Thu Ha',
    email: 'ha.admin@example.com',
    role: 'Admin',
    area: 'System',
    lastSeen: 'Yesterday 17:15',
    status: 'locked',
  },
]

export const ADMIN_ROLES: AdminRole[] = [
  {
    name: 'Admin',
    users: 2,
    scope: 'System-wide',
    permissions: ['Users', 'Roles', 'Buildings', 'Audit'],
  },
  {
    name: 'Manager',
    users: 4,
    scope: 'Operations',
    permissions: ['Slots', 'Bookings', 'Staff', 'Reports'],
  },
  {
    name: 'Staff',
    users: 8,
    scope: 'Gate workflow',
    permissions: ['Check-in', 'Checkout', 'Incidents'],
  },
  {
    name: 'User',
    users: 128,
    scope: 'Self-service',
    permissions: ['Booking', 'Payment', 'History'],
  },
]

export const ADMIN_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'AUD-7741',
    actor: 'Tran Hoang Nam',
    action: 'Updated manager permissions',
    target: 'Manager role',
    time: '10:12',
    status: 'enabled',
  },
  {
    id: 'AUD-7740',
    actor: 'System',
    action: 'Blocked repeated failed login',
    target: 'ha.admin@example.com',
    time: '09:37',
    status: 'warning',
  },
  {
    id: 'AUD-7739',
    actor: 'Nguyen Minh Anh',
    action: 'Changed phone number',
    target: 'USR-1001',
    time: 'Yesterday',
    status: 'enabled',
  },
]

export const ADMIN_CONTROLS: AdminControl[] = [
  {
    title: 'Account lifecycle',
    detail: 'Invite, lock, unlock and review users across all roles.',
    owner: 'Admin',
    status: 'enabled',
  },
  {
    title: 'Role permissions',
    detail: 'Define which modules Admin, Manager, Staff and User can access.',
    owner: 'Admin',
    status: 'enabled',
  },
  {
    title: 'Building setup',
    detail: 'Control towers, floors, zones, pricing rules and operating hours.',
    owner: 'Admin + Manager',
    status: 'enabled',
  },
  {
    title: 'Security audit',
    detail: 'Watch failed logins, sensitive changes and permission updates.',
    owner: 'Admin',
    status: 'warning',
  },
]

export const ADMIN_FLOORS: AdminFloor[] = [
  {
    id: 'FL-A-B1',
    building: 'Tower A',
    floor: 'B1',
    zones: 2,
    totalSlots: 72,
    occupiedSlots: 40,
    manager: 'Tran Hoang Nam',
    status: 'enabled',
  },
  {
    id: 'FL-A-B2',
    building: 'Tower A',
    floor: 'B2',
    zones: 2,
    totalSlots: 64,
    occupiedSlots: 38,
    manager: 'Tran Hoang Nam',
    status: 'enabled',
  },
  {
    id: 'FL-B-B1',
    building: 'Tower B',
    floor: 'B1',
    zones: 1,
    totalSlots: 48,
    occupiedSlots: 29,
    manager: 'Nguyen Van Quan',
    status: 'warning',
  },
  {
    id: 'FL-C-B1',
    building: 'Tower C',
    floor: 'B1',
    zones: 1,
    totalSlots: 36,
    occupiedSlots: 0,
    manager: 'Maintenance Team',
    status: 'maintenance',
  },
]

export const ADMIN_SLOTS: AdminSlot[] = [
  {
    id: 'SL-A-B1-A01',
    code: 'A-B1-A01',
    building: 'Tower A',
    floor: 'B1',
    zone: 'Zone A',
    vehicleType: 'Motorbike',
    bookingId: 'BK-2042',
    status: 'reserved',
  },
  {
    id: 'SL-A-B1-A02',
    code: 'A-B1-A02',
    building: 'Tower A',
    floor: 'B1',
    zone: 'Zone A',
    vehicleType: 'Motorbike',
    bookingId: '-',
    status: 'available',
  },
  {
    id: 'SL-A-B2-C18',
    code: 'A-B2-C18',
    building: 'Tower A',
    floor: 'B2',
    zone: 'Car Zone',
    vehicleType: 'Car',
    bookingId: 'BK-2041',
    status: 'occupied',
  },
  {
    id: 'SL-A-B2-E04',
    code: 'A-B2-E04',
    building: 'Tower A',
    floor: 'B2',
    zone: 'EV Bay',
    vehicleType: 'EV',
    bookingId: 'BK-2043',
    status: 'reserved',
  },
  {
    id: 'SL-C-B1-M01',
    code: 'C-B1-M01',
    building: 'Tower C',
    floor: 'B1',
    zone: 'Zone M',
    vehicleType: 'Car',
    bookingId: '-',
    status: 'maintenance',
  },
]

export const ADMIN_BOOKINGS: AdminBooking[] = [
  {
    id: 'BK-2041',
    customer: 'Nguyen Minh Anh',
    plate: '51G-882.14',
    slot: 'A-B2-C18',
    building: 'Tower A',
    schedule: 'Today 09:00 - 12:00',
    amount: 45000,
    payment: 'Paid',
    status: 'confirmed',
  },
  {
    id: 'BK-2042',
    customer: 'Tran Hoang Nam',
    plate: '59X2-481.22',
    slot: 'A-B1-A01',
    building: 'Tower A',
    schedule: 'Today 13:00 - 18:00',
    amount: 40000,
    payment: 'Unpaid',
    status: 'pending',
  },
  {
    id: 'BK-2043',
    customer: 'Le Gia Huy',
    plate: '60A-119.77',
    slot: 'A-B2-E04',
    building: 'Tower A',
    schedule: 'Tomorrow 08:00 - 17:00',
    amount: 198000,
    payment: 'Paid',
    status: 'confirmed',
  },
  {
    id: 'BK-2038',
    customer: 'Pham Thu Ha',
    plate: '51K7-902.16',
    slot: 'B-B1-B07',
    building: 'Tower B',
    schedule: 'Yesterday 16:00 - 18:00',
    amount: 30000,
    payment: 'Refunded',
    status: 'cancelled',
  },
]

export const adminStatusTone: Record<AdminStatus, string> = {
  active: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  pending: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
  locked: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
  enabled: 'border-sky-400/40 bg-sky-500/10 text-sky-200',
  warning: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
  critical: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
  empty: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  available: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  full: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
  occupied: 'border-sky-400/40 bg-sky-500/10 text-sky-200',
  reserved: 'border-amber-400/40 bg-amber-500/10 text-amber-100',
  maintenance: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
  'active-session': 'border-sky-400/40 bg-sky-500/10 text-sky-200',
  completed: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  confirmed: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-200',
  cancelled: 'border-rose-400/40 bg-rose-500/10 text-rose-200',
}

export function getRoleCount(role: AdminUser['role']) {
  return ADMIN_USERS.filter((user) => user.role === role).length
}

export function formatAdminCurrency(value: number) {
  return `${value.toLocaleString('vi-VN')} VND`
}
