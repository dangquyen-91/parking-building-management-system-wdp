import type { ManagerBooking, ManagerBookingStatus } from '../../../services/managerBookingsApi'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { TableCell, TableRow } from '@/components/ui/table'
import { ManagerTableShell } from '../common/ManagerTableShell'

const STATUS_LABELS: Record<ManagerBookingStatus, string> = {
  pending: 'Chờ thanh toán', paid: 'Đã thanh toán', used: 'Đã sử dụng', expired: 'Hết hạn', cancelled: 'Đã hủy',
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
    hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
  }).format(new Date(value))
}

function getCustomerName(booking: ManagerBooking) {
  if (!booking.userId || typeof booking.userId === 'string') return 'Khách chưa đăng nhập'
  return booking.userId.fullName || booking.userId.email || 'Khách hàng'
}

type ManagerBookingListProps = { bookings: ManagerBooking[]; isLoading: boolean }

export function ManagerBookingList({ bookings, isLoading }: ManagerBookingListProps) {
  if (isLoading) {
    return <Card><CardContent className="grid gap-3 p-4"><Skeleton className="h-6 w-48" /><Skeleton className="h-24 w-full" /><Skeleton className="h-24 w-full" /></CardContent></Card>
  }
  if (bookings.length === 0) {
    return <Card><CardContent className="p-4 text-sm text-muted-foreground">Không có booking phù hợp.</CardContent></Card>
  }

  return (
    <ManagerTableShell
      eyebrow="Danh sách đặt chỗ" title="Booking gần đây" countLabel={`${bookings.length} booking`}
      columns={[
        { label: 'Biển số', className: 'w-[15%]' }, { label: 'Khách hàng', className: 'w-[20%]' },
        { label: 'Thời gian đến', className: 'w-[18%]' }, { label: 'Thời gian rời', className: 'w-[18%]' },
        { label: 'Số tiền', className: 'w-[14%]' }, { label: 'Trạng thái', className: 'w-[15%]' },
      ]}
    >
      {bookings.map((booking) => (
        <TableRow key={booking._id}>
          <TableCell className="px-4 py-4"><p className="truncate font-black tracking-[0.06em] text-foreground">{booking.licensePlate}</p></TableCell>
          <TableCell className="px-4 py-4"><p className="truncate font-semibold text-foreground">{getCustomerName(booking)}</p><p className="mt-1 truncate text-xs text-muted-foreground">{booking.phone}</p></TableCell>
          <TableCell className="px-4 py-4 font-medium text-foreground">{formatDateTime(booking.expectedArrivalTime)}</TableCell>
          <TableCell className="px-4 py-4"><p className="font-medium text-foreground">{formatDateTime(booking.expectedExitTime)}</p><p className="mt-1 text-xs text-muted-foreground">{booking.durationHours} giờ</p></TableCell>
          <TableCell className="px-4 py-4 font-bold text-foreground">{booking.amount.toLocaleString('vi-VN')} VND</TableCell>
          <TableCell className="px-4 py-4"><Badge variant="outline" className={`gap-1.5 ${STATUS_TONES[booking.status]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{STATUS_LABELS[booking.status]}</Badge></TableCell>
        </TableRow>
      ))}
    </ManagerTableShell>
  )
}
