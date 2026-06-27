import type {
  ManagerSubscriptionStatus,
  ManagerSubscriptionVehicleType,
} from '../../../services/managerSubscriptionsApi'

export type ManagerSubscriptionStatusFilter = ManagerSubscriptionStatus | 'all' | 'expiring'
export type ManagerSubscriptionVehicleFilter = ManagerSubscriptionVehicleType | 'all'

type Props = {
  query: string
  status: ManagerSubscriptionStatusFilter
  vehicleType: ManagerSubscriptionVehicleFilter
  onQueryChange: (value: string) => void
  onStatusChange: (value: ManagerSubscriptionStatusFilter) => void
  onVehicleTypeChange: (value: ManagerSubscriptionVehicleFilter) => void
}

export function ManagerSubscriptionFilters({
  query,
  status,
  vehicleType,
  onQueryChange,
  onStatusChange,
  onVehicleTypeChange,
}: Props) {
  return (
    <div className="grid gap-2 sm:grid-cols-3">
      <input
        type="search"
        value={query}
        placeholder="Tên, email, SĐT hoặc biển số"
        onChange={(event) => onQueryChange(event.target.value)}
        className="h-10 min-w-0 rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-btn-primary"
      />
      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value as ManagerSubscriptionStatusFilter)}
        className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
      >
        <option value="all">Tất cả trạng thái</option>
        <option value="active">Đang hoạt động</option>
        <option value="expiring">Sắp hết hạn</option>
        <option value="pending">Chờ thanh toán</option>
        <option value="expired">Đã hết hạn</option>
        <option value="cancelled">Đã hủy</option>
      </select>
      <select
        value={vehicleType}
        onChange={(event) => onVehicleTypeChange(event.target.value as ManagerSubscriptionVehicleFilter)}
        className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
      >
        <option value="all">Tất cả loại xe</option>
        <option value="motorcycle">Xe máy</option>
        <option value="car">Ô tô</option>
      </select>
    </div>
  )
}
