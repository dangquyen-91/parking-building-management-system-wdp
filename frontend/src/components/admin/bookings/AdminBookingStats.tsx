import type { AdminBooking } from '../../../services/adminApi'
import { AdminStatCard } from '../common/AdminStatCard'
import { formatAdminCurrency } from '../adminData'

export function AdminBookingStats({ bookings, isLoading }: { bookings: AdminBooking[]; isLoading: boolean }) {
  const pending = bookings.filter((item) => item.status === 'pending').length
  const paid = bookings.filter((item) => item.status === 'paid').length
  const used = bookings.filter((item) => item.status === 'used').length
  const revenue = bookings.filter((item) => item.status === 'paid' || item.status === 'used').reduce((sum, item) => sum + item.amount, 0)
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><AdminStatCard label="Tổng booking" value={isLoading ? '-' : bookings.length} detail="Tất cả trạng thái" tone="violet" /><AdminStatCard label="Chờ thanh toán" value={isLoading ? '-' : pending} detail="Chưa hoàn tất giao dịch" tone="amber" /><AdminStatCard label="Sẵn sàng sử dụng" value={isLoading ? '-' : paid} detail={`${used} booking đã sử dụng`} tone="emerald" /><AdminStatCard label="Doanh thu booking" value={isLoading ? '-' : formatAdminCurrency(revenue)} detail="Đã thanh toán và sử dụng" tone="sky" /></div>
}

