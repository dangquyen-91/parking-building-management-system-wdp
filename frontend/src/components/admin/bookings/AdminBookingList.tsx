import type { AdminBooking } from '../../../services/adminApi'
import { AdminStatusBadge } from '../common/AdminStatusBadge'
import { formatAdminCurrency } from '../adminData'
import { formatOperationDateTime, OperationEmpty, OperationInfoCell, OperationListShell } from '../operations/AdminOperationPrimitives'

export function AdminBookingList({ bookings, isLoading }: { bookings: AdminBooking[]; isLoading: boolean }) {
  if (isLoading) return <OperationEmpty text="Đang tải danh sách booking..." />
  if (!bookings.length) return <OperationEmpty text="Không có booking phù hợp." />
  return <OperationListShell eyebrow="Danh sách đặt chỗ" title="Booking gần đây" count={`${bookings.length} booking`} tone="booking">{bookings.map((booking) => {
    const customer = booking.userId && typeof booking.userId !== 'string' ? booking.userId : null
    const stripe = booking.status === 'paid' || booking.status === 'used' ? 'bg-emerald-500' : booking.status === 'pending' ? 'bg-amber-500' : booking.status === 'cancelled' ? 'bg-rose-500' : 'bg-slate-400'
    return <article key={booking._id} className="group relative overflow-hidden rounded-2xl border border-theme bg-badge p-4 transition-all hover:-translate-y-0.5 hover:border-violet-500/25 hover:bg-violet-500/5 hover:shadow-lg"><span className={`absolute inset-y-0 left-0 w-1 ${stripe}`} /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6 xl:items-center"><div className="min-w-0 rounded-xl bg-page/45 p-3"><p className="truncate text-lg font-black tracking-[0.06em] text-fg">{booking.licensePlate}</p><p className="mt-1 truncate text-[10px] text-subtle">{booking._id}</p></div><OperationInfoCell label="Khách hàng" value={customer?.fullName ?? customer?.email ?? 'Khách vãng lai'} detail={booking.phoneNumber} /><OperationInfoCell label="Thời gian đến" value={formatOperationDateTime(booking.expectedArrivalTime)} /><OperationInfoCell label="Thời gian rời" value={formatOperationDateTime(booking.expectedExitTime)} detail={`${booking.durationHours} giờ`} /><OperationInfoCell label="Số tiền" value={formatAdminCurrency(booking.amount)} strong /><div className="flex min-h-20 items-center rounded-xl bg-page/45 p-3"><AdminStatusBadge status={booking.status} /></div></div></article>
  })}</OperationListShell>
}
