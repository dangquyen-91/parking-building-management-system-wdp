import type { GateCustomerType, GateVehicleType } from '../../../services/staffGateApi'

export type ManagerGateVehicleFilter = 'all' | GateVehicleType
export type ManagerGateCustomerFilter = 'all' | GateCustomerType

type ManagerGateLogFiltersProps = {
  query: string
  vehicleFilter: ManagerGateVehicleFilter
  customerFilter: ManagerGateCustomerFilter
  onQueryChange: (value: string) => void
  onVehicleFilterChange: (value: ManagerGateVehicleFilter) => void
  onCustomerFilterChange: (value: ManagerGateCustomerFilter) => void
}

export function ManagerGateLogFilters({
  query,
  vehicleFilter,
  customerFilter,
  onQueryChange,
  onVehicleFilterChange,
  onCustomerFilterChange,
}: ManagerGateLogFiltersProps) {
  return (
    <div className="grid w-full gap-3 md:grid-cols-3 xl:w-auto xl:min-w-[44rem]">
      <label className="grid gap-1 text-xs font-medium text-subtle">
        Tìm biển số
        <input
          className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-btn-primary"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Ví dụ: 51G-882.14"
        />
      </label>

      <label className="grid gap-1 text-xs font-medium text-subtle">
        Loại xe
        <select
          className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
          value={vehicleFilter}
          onChange={(event) => onVehicleFilterChange(event.target.value as ManagerGateVehicleFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="motorcycle">Xe máy</option>
          <option value="car">Ô tô</option>
        </select>
      </label>

      <label className="grid gap-1 text-xs font-medium text-subtle">
        Loại khách
        <select
          className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
          value={customerFilter}
          onChange={(event) => onCustomerFilterChange(event.target.value as ManagerGateCustomerFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="resident">Cư dân</option>
          <option value="walk_in">Khách vãng lai</option>
        </select>
      </label>
    </div>
  )
}
