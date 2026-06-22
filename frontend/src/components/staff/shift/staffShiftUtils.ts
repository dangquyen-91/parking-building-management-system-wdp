import type { GateSession } from '../../../services/staffGateApi'

export type ShiftStat = {
  label: string
  value: string | number
  detail: string
  tone: 'sky' | 'emerald' | 'amber' | 'violet'
}

export function isShiftSessionToday(value?: string) {
  if (!value) return false
  const date = new Date(value)
  const today = new Date()
  return (
    date.getFullYear() === today.getFullYear()
    && date.getMonth() === today.getMonth()
    && date.getDate() === today.getDate()
  )
}

export function getSessionStaffName(session: GateSession) {
  const staff = session.checkOutStaffId || session.staffId
  if (!staff || typeof staff === 'string') return 'Nhân viên hiện tại'
  return staff.fullName || staff.email || 'Nhân viên hiện tại'
}

export function formatShiftPaymentMethod(session: GateSession) {
  if (session.paymentMethod === 'cash') return 'Tiền mặt'
  if (session.paymentMethod === 'transfer') return 'Chuyển khoản'
  return session.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'
}
