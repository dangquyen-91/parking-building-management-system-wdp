import type { ManagerBookingStatus } from '../../services/managerBookingsApi'

export type ManagerBookingStatusFilter = 'all' | ManagerBookingStatus

type ManagerBookingFiltersProps = {
  query: string
  statusFilter: ManagerBookingStatusFilter
  onQueryChange: (value: string) => void
  onStatusFilterChange: (value: ManagerBookingStatusFilter) => void
}

export function ManagerBookingFilters({
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
}: ManagerBookingFiltersProps) {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:min-w-[32rem]">
      <label className="grid gap-1 text-xs font-medium text-subtle">
        Tìm kiếm
        <input
          className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-btn-primary"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Biển số, số điện thoại hoặc khách hàng"
        />
      </label>

      <label className="grid gap-1 text-xs font-medium text-subtle">
        Trạng thái
        <select
          className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as ManagerBookingStatusFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ thanh toán</option>
          <option value="paid">Đã thanh toán</option>
          <option value="used">Đã sử dụng</option>
          <option value="expired">Hết hạn</option>
          <option value="cancelled">Đã hủy</option>
        </select>
      </label>
    </div>
  )
}
