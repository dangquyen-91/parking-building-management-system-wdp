import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import type { ManagerBookingStatus } from '../../../services/managerBookingsApi'

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
      <div className="grid gap-2">
        <Label htmlFor="manager-booking-search" className="text-xs text-muted-foreground">
          Tìm kiếm
        </Label>
        <Input
          id="manager-booking-search"
          className="h-10"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Biển số, số điện thoại hoặc khách hàng"
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="manager-booking-status" className="text-xs text-muted-foreground">
          Trạng thái
        </Label>
        <NativeSelect
          id="manager-booking-status"
          className="w-full"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as ManagerBookingStatusFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="pending">Chờ thanh toán</option>
          <option value="paid">Đã thanh toán</option>
          <option value="used">Đã sử dụng</option>
          <option value="expired">Hết hạn</option>
          <option value="cancelled">Đã hủy</option>
        </NativeSelect>
      </div>
    </div>
  )
}
