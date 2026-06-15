import type { ManagerPlan } from '../../services/managerPlansApi'

export type ManagerPlanVehicleFilter = 'all' | ManagerPlan['vehicleType']
export type ManagerPlanStatusFilter = 'all' | 'active' | 'inactive'

type ManagerPlanFiltersProps = {
  vehicleFilter: ManagerPlanVehicleFilter
  statusFilter: ManagerPlanStatusFilter
  onVehicleFilterChange: (value: ManagerPlanVehicleFilter) => void
  onStatusFilterChange: (value: ManagerPlanStatusFilter) => void
}

export function ManagerPlanFilters({
  vehicleFilter,
  statusFilter,
  onVehicleFilterChange,
  onStatusFilterChange,
}: ManagerPlanFiltersProps) {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:min-w-[30rem]">
      <label className="grid gap-1 text-xs font-medium text-subtle">
        Loại xe
        <select
          className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
          value={vehicleFilter}
          onChange={(event) => onVehicleFilterChange(event.target.value as ManagerPlanVehicleFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="motorcycle">Xe máy</option>
          <option value="car">Ô tô</option>
        </select>
      </label>

      <label className="grid gap-1 text-xs font-medium text-subtle">
        Trạng thái
        <select
          className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as ManagerPlanStatusFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="active">Đang mở bán</option>
          <option value="inactive">Tạm dừng</option>
        </select>
      </label>
    </div>
  )
}
