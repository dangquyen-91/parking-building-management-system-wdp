import type { ManagerBooking, ManagerBookingStatus } from '../../../services/managerBookingsApi'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

const STATUS_LABELS: Record<ManagerBookingStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  used: 'Đã sử dụng',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
}

const STATUS_TONES: Record<ManagerBookingStatus, string> = {
  pending: 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  paid: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
  used: 'border-sky-500/30 bg-sky-500/10 text-sky-700 dark:text-sky-300',
  expired: 'border-border bg-muted text-muted-foreground',
  cancelled: 'border-destructive/30 bg-destructive/10 text-destructive',
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function getCustomerName(booking: ManagerBooking) {
  if (!booking.userId || typeof booking.userId === 'string') return 'Khách chưa đăng nhập'
  return booking.userId.fullName || booking.userId.email || 'Khách hàng'
}

type ManagerBookingCardProps = {
  booking: ManagerBooking
}

export function ManagerBookingCard({ booking }: ManagerBookingCardProps) {
  return (
    <Card className="shadow-sm transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6 xl:items-center">
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Biển số xe</p>
            <p className="truncate text-lg font-semibold tracking-[0.06em] text-foreground">{booking.licensePlate}</p>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Khách hàng</p>
            <p className="mt-1 truncate font-medium text-foreground">{getCustomerName(booking)}</p>
            <p className="mt-1 truncate text-xs text-muted-foreground">{booking.phoneNumber}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Thời gian đến</p>
            <p className="mt-1 font-medium text-foreground">{formatDateTime(booking.expectedArrivalTime)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Thời gian rời</p>
            <p className="mt-1 font-medium text-foreground">{formatDateTime(booking.expectedExitTime)}</p>
            <p className="mt-1 text-xs text-muted-foreground">{booking.durationHours} giờ</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Số tiền</p>
            <p className="mt-1 font-semibold text-foreground">{booking.amount.toLocaleString('vi-VN')} VND</p>
          </div>
          <div>
            <Badge variant="outline" className={`gap-1.5 ${STATUS_TONES[booking.status]}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              {STATUS_LABELS[booking.status]}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


