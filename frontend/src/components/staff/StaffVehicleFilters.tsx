import type { StaffCustomerFilter, StaffVehicleFilter } from '../../hooks/useStaffVehicles'

type StaffVehicleFiltersProps = {
  query: string
  vehicleFilter: StaffVehicleFilter
  customerFilter: StaffCustomerFilter
  onQueryChange: (value: string) => void
  onVehicleFilterChange: (value: StaffVehicleFilter) => void
  onCustomerFilterChange: (value: StaffCustomerFilter) => void
}

export function StaffVehicleFilters({
  query,
  vehicleFilter,
  customerFilter,
  onQueryChange,
  onVehicleFilterChange,
  onCustomerFilterChange,
}: StaffVehicleFiltersProps) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      <label className="grid gap-1 text-xs font-medium text-subtle">
        Tìm xe
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Biển số, mã phiên hoặc vị trí"
          className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
        />
      </label>

      <label className="grid gap-1 text-xs font-medium text-subtle">
        Loại xe
        <select
          value={vehicleFilter}
          onChange={(event) => onVehicleFilterChange(event.target.value as StaffVehicleFilter)}
          className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
        >
          <option value="all">Tất cả</option>
          <option value="motorcycle">Xe máy</option>
          <option value="car">Ô tô</option>
        </select>
      </label>

      <label className="grid gap-1 text-xs font-medium text-subtle">
        Loại khách
        <select
          value={customerFilter}
          onChange={(event) => onCustomerFilterChange(event.target.value as StaffCustomerFilter)}
          className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
        >
          <option value="all">Tất cả</option>
          <option value="resident">Cư dân</option>
          <option value="walk_in">Khách vãng lai</option>
        </select>
      </label>
    </div>
  )
}
