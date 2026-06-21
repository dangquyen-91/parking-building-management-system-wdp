import type { AdminBooking } from '../../../services/adminApi'
import { OperationField } from '../operations/AdminOperationPrimitives'

export type AdminBookingStatusFilter = 'all' | AdminBooking['status']

export function AdminBookingFilters({ query, statusFilter, onQueryChange, onStatusFilterChange }: { query: string; statusFilter: AdminBookingStatusFilter; onQueryChange: (value: string) => void; onStatusFilterChange: (value: AdminBookingStatusFilter) => void }) {
  return <div className="grid w-full gap-3 rounded-2xl border border-theme bg-page/55 p-3 shadow-sm backdrop-blur-sm sm:grid-cols-2 xl:min-w-[34rem]"><OperationField label="Tìm kiếm"><input className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/15" value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Biển số, số điện thoại hoặc khách hàng" /></OperationField><OperationField label="Trạng thái"><select className="h-11 min-w-0 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-500/15" value={statusFilter} onChange={(event) => onStatusFilterChange(event.target.value as AdminBookingStatusFilter)}><option value="all">Tất cả</option><option value="pending">Chờ thanh toán</option><option value="paid">Đã thanh toán</option><option value="used">Đã sử dụng</option><option value="expired">Hết hạn</option><option value="cancelled">Đã hủy</option></select></OperationField></div>
}
