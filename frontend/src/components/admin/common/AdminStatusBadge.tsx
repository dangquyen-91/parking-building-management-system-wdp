import { adminStatusTone, type AdminStatus } from '../adminData'
import { Badge } from '../../ui/badge'

type AdminStatusBadgeProps = {
  status: AdminStatus
  label?: string
}

const statusLabels: Record<AdminStatus, string> = {
  active: 'Hoạt động',
  inactive: 'Ngưng hoạt động',
  pending: 'Chờ xử lý',
  locked: 'Đã khóa',
  enabled: 'Đang bật',
  warning: 'Cần chú ý',
  critical: 'Nghiêm trọng',
  empty: 'Trống',
  available: 'Còn chỗ',
  occupied: 'Đang dùng',
  reserved: 'Đã đặt',
  maintenance: 'Bảo trì',
  confirmed: 'Đã xác nhận',
  paid: 'Đã thanh toán',
  unpaid: 'Chưa thanh toán',
  used: 'Đã dùng',
  completed: 'Hoàn tất',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
  full: 'Đã đầy',
}

export function AdminStatusBadge({ status, label = statusLabels[status] }: AdminStatusBadgeProps) {
  return (
    <Badge variant="outline" className={['min-w-20 justify-center rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide', adminStatusTone[status]].join(' ')}>
      {label}
    </Badge>
  )
}
