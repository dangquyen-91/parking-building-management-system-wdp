import type { AdminBooking } from '../../../services/adminApi'
import { AdminStatusBadge } from '../common/AdminStatusBadge'
import { formatAdminCurrency } from '../adminData'
import { formatOperationDateTime, OperationEmpty, OperationInfoCell, OperationListShell } from '../operations/AdminOperationPrimitives'
import { Card, CardContent } from '../../ui/card'

export function AdminBookingList({ bookings, isLoading }: { bookings: AdminBooking[]; isLoading: boolean }) {
  if (isLoading) return <OperationEmpty text="Đang tải danh sách booking..." />
  if (!bookings.length) return <OperationEmpty text="Không có booking phù hợp." />
  return <OperationListShell eyebrow="Danh sách đặt chỗ" title="Booking gần đây" count={`${bookings.length} booking`} tone="booking">{bookings.map((booking) => { const customer = booking.userId && typeof booking.userId !== 'string' ? booking.userId : null; return <Card key={booking._id}><CardContent className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-6 xl:items-center"><p className="font-semibold">{booking.licensePlate}</p><OperationInfoCell label="Khách hàng" value={customer?.fullName ?? customer?.email ?? 'Khách vãng lai'} detail={booking.phoneNumber} /><OperationInfoCell label="Thời gian đến" value={formatOperationDateTime(booking.expectedArrivalTime)} /><OperationInfoCell label="Thời gian rời" value={formatOperationDateTime(booking.expectedExitTime)} detail={`${booking.durationHours} giờ`} /><OperationInfoCell label="Số tiền" value={formatAdminCurrency(booking.amount)} strong /><AdminStatusBadge status={booking.status} /></CardContent></Card> })}</OperationListShell>
}

