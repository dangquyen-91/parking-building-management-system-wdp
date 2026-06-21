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
      <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-subtle">
        Tìm kiếm nhanh
        <input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Biển số, mã phiên hoặc vị trí"
          className="h-12 rounded-2xl border border-theme bg-page px-4 text-sm font-semibold uppercase tracking-wide text-fg outline-none transition-colors focus:border-sky-500"
        />
      </label>

      <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-subtle">
        Loại xe
        <select
          value={vehicleFilter}
          onChange={(event) => onVehicleFilterChange(event.target.value as StaffVehicleFilter)}
          className="h-12 rounded-2xl border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-sky-500"
        >
          <option value="all">Tất cả</option>
          <option value="motorcycle">Xe máy</option>
          <option value="car">Ô tô</option>
        </select>
      </label>

      <label className="grid gap-2 text-xs font-bold uppercase tracking-[0.12em] text-subtle">
        Loại khách
        <select
          value={customerFilter}
          onChange={(event) => onCustomerFilterChange(event.target.value as StaffCustomerFilter)}
          className="h-12 rounded-2xl border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-sky-500"
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
        className="h-12 rounded-2xl border border-theme bg-page px-4 text-sm font-bold text-fg transition-colors hover:bg-ghost disabled:cursor-not-allowed disabled:opacity-40"
      >
        Xóa bộ lọc
      </button>
    </div>
  )
}
