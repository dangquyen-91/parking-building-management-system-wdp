import type { ManagerBooking } from '../../../services/managerBookingsApi'
import { formatCurrency } from '../managerUi'
import { ManagerStatCard } from '../common/ManagerStatCard'

type ManagerBookingStatsProps = {
  bookings: ManagerBooking[]
  isLoading: boolean
}

export function ManagerBookingStats({ bookings, isLoading }: ManagerBookingStatsProps) {
  const pendingCount = bookings.filter((booking) => booking.status === 'pending').length
  const paidCount = bookings.filter((booking) => booking.status === 'paid').length
  const usedCount = bookings.filter((booking) => booking.status === 'used').length
  const revenue = bookings
    .filter((booking) => booking.status === 'paid' || booking.status === 'used')
    .reduce((sum, booking) => sum + booking.amount, 0)

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ManagerStatCard label="Tổng booking" value={isLoading ? '-' : bookings.length} detail="Tất cả trạng thái" />
      <ManagerStatCard label="Chờ thanh toán" value={isLoading ? '-' : pendingCount} detail="Chưa hoàn tất thanh toán" />
      <ManagerStatCard label="Sẵn sàng sử dụng" value={isLoading ? '-' : paidCount} detail={`${usedCount} booking đã sử dụng`} />
      <ManagerStatCard label="Doanh thu booking" value={isLoading ? '-' : formatCurrency(revenue)} detail="Đã thanh toán và đã sử dụng" />
    </div>
  )
}
