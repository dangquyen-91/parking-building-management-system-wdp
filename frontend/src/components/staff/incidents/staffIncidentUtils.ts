import type { Complaint, ComplaintStatus, ComplaintUser } from '../../../services/complaintsApi'

export const INCIDENT_STATUS_LABELS: Record<ComplaintStatus, string> = {
  open: 'Mới gửi',
  in_progress: 'Đang xử lý',
  resolved: 'Đã xử lý',
}

export const INCIDENT_STATUS_TONE: Record<ComplaintStatus, string> = {
  open: 'border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-200',
  in_progress: 'border-sky-400/40 bg-sky-500/10 text-sky-700 dark:text-sky-200',
  resolved: 'border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200',
}

export function formatIncidentDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

export function getComplaintUserName(value?: ComplaintUser | string | null) {
  if (!value || typeof value === 'string') return 'Không xác định'
  return value.fullName ?? value.email ?? value.phone ?? 'Không xác định'
}

export function getComplaintUserPhone(value?: ComplaintUser | string | null) {
  if (!value || typeof value === 'string') return undefined
  return value.phone
}

export function getComplaintSlotCode(complaint: Complaint) {
  const slot = complaint.slotId
  if (!slot || typeof slot === 'string') return '-'
  return slot.slotCode ?? '-'
}

export function getComplaintResolutionNote(status: ComplaintStatus) {
  return status === 'in_progress'
    ? 'Nhân viên đã tiếp nhận và đang liên hệ chủ xe.'
    : 'Đã xác nhận xử lý xong khiếu nại đậu sai chỗ.'
}
