import type { GateVehicleType } from '../../../services/staffGateApi'

export type ManagerLostTicketVehicleFilter = 'all' | GateVehicleType

type ManagerLostTicketFiltersProps = {
  query: string
  vehicleFilter: ManagerLostTicketVehicleFilter
  onQueryChange: (value: string) => void
  onVehicleFilterChange: (value: ManagerLostTicketVehicleFilter) => void
}

export function ManagerLostTicketFilters({
  query,
  vehicleFilter,
  onQueryChange,
  onVehicleFilterChange,
}: ManagerLostTicketFiltersProps) {
  return (
    <div className="grid w-full gap-3 md:grid-cols-2 xl:w-auto xl:min-w-[34rem]">
      <label className="grid gap-1 text-xs font-medium text-subtle">
        Tìm biển số
        <input
          className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-btn-primary"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Ví dụ: 61K-424.94"
        />
      </label>

      <label className="grid gap-1 text-xs font-medium text-subtle">
        Loại xe
        <select
          className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
          value={vehicleFilter}
          onChange={(event) => onVehicleFilterChange(event.target.value as ManagerLostTicketVehicleFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="motorcycle">Xe máy</option>
          <option value="car">Ô tô</option>
        </select>
      </label>
    </div>
  )
}
