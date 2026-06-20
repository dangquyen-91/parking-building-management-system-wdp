import type { StaffCustomerFilter, StaffVehicleFilter } from '../../../hooks/useStaffVehicles'

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
  const hasFilters = query || vehicleFilter !== 'all' || customerFilter !== 'all'

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_12rem_12rem_auto] lg:items-end">
      <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
        Tìm kiếm nhanh
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Biển số, mã phiên hoặc vị trí"
          className="auth-input h-12 rounded-xl border px-4 text-sm font-semibold uppercase tracking-wide text-fg"
        />
      </label>

      <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
        Loại xe
        <select
          value={vehicleFilter}
          onChange={(event) => onVehicleFilterChange(event.target.value as StaffVehicleFilter)}
          className="auth-input h-12 rounded-xl border px-3 text-sm text-fg"
        >
          <option value="all">Tất cả</option>
          <option value="motorcycle">Xe máy</option>
          <option value="car">Ô tô</option>
        </select>
      </label>

      <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-subtle">
        Loại khách
        <select
          value={customerFilter}
          onChange={(event) => onCustomerFilterChange(event.target.value as StaffCustomerFilter)}
          className="auth-input h-12 rounded-xl border px-3 text-sm text-fg"
        >
          <option value="all">Tất cả</option>
          <option value="resident">Cư dân</option>
          <option value="walk_in">Khách vãng lai</option>
        </select>
      </label>

      <button
        type="button"
        disabled={!hasFilters}
        onClick={() => {
          onQueryChange('')
          onVehicleFilterChange('all')
          onCustomerFilterChange('all')
        }}
        className="h-12 rounded-xl border border-theme bg-badge px-4 text-sm font-semibold text-fg transition-colors hover:bg-ghost disabled:cursor-not-allowed disabled:opacity-40"
      >
        Xóa bộ lọc
      </button>
    </div>
  )
}
