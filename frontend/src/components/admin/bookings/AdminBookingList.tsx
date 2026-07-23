import type { AdminBooking } from '../../../services/adminApi'
import { TableCell, TableRow } from '../../ui/table'
import { formatAdminCurrency } from '../adminData'
import { AdminStatusBadge } from '../common/AdminStatusBadge'
import { AdminTableShell } from '../common/AdminTableShell'
import { formatOperationDateTime, OperationEmpty } from '../operations/AdminOperationPrimitives'

export function AdminBookingList({ bookings, isLoading }: { bookings: AdminBooking[]; isLoading: boolean }) {
  if (isLoading) return <OperationEmpty text="Đang tải danh sách booking..." />
  if (!bookings.length) return <OperationEmpty text="Không có booking phù hợp." />
  return <AdminTableShell eyebrow="Danh sách đặt chỗ" title="Booking gần đây" countLabel={`${bookings.length} booking`} minWidth="1050px" columns={[
    { label: 'Biển số', className: 'w-[15%]' }, { label: 'Khách hàng', className: 'w-[21%]' }, { label: 'Thời gian đến', className: 'w-[18%]' }, { label: 'Thời gian rời', className: 'w-[18%]' }, { label: 'Số tiền', className: 'w-[14%]' }, { label: 'Trạng thái', className: 'w-[14%]' },
  ]}>{bookings.map((booking) => { const customer = booking.userId && typeof booking.userId !== 'string' ? booking.userId : null; return <TableRow key={booking._id}><TableCell className="px-4 py-4 font-black tracking-[0.06em]">{booking.licensePlate}</TableCell><TableCell className="px-4 py-4"><p className="truncate font-semibold">{customer?.fullName ?? customer?.email ?? 'Khách vãng lai'}</p><p className="mt-1 text-xs text-muted-foreground">{booking.phone}</p></TableCell><TableCell className="px-4 py-4">{formatOperationDateTime(booking.expectedArrivalTime)}</TableCell><TableCell className="px-4 py-4"><p>{formatOperationDateTime(booking.expectedExitTime)}</p><p className="mt-1 text-xs text-muted-foreground">{booking.durationHours} giờ</p></TableCell><TableCell className="px-4 py-4 font-bold">{formatAdminCurrency(booking.amount)}</TableCell><TableCell className="px-4 py-4"><AdminStatusBadge status={booking.status} /></TableCell></TableRow> })}</AdminTableShell>
}
