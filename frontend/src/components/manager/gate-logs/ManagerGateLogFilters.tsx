import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import type { GateCustomerType, GateSessionStatus, GateVehicleType } from '../../../services/staffGateApi'

export type ManagerGateVehicleFilter = 'all' | GateVehicleType
export type ManagerGateCustomerFilter = 'all' | GateCustomerType
export type ManagerGateStatusFilter = 'all' | Extract<GateSessionStatus, 'active' | 'completed'>

type ManagerGateLogFiltersProps = {
  query: string
  statusFilter: ManagerGateStatusFilter
  vehicleFilter: ManagerGateVehicleFilter
  customerFilter: ManagerGateCustomerFilter
  onQueryChange: (value: string) => void
  onStatusFilterChange: (value: ManagerGateStatusFilter) => void
  onVehicleFilterChange: (value: ManagerGateVehicleFilter) => void
  onCustomerFilterChange: (value: ManagerGateCustomerFilter) => void
}

export function ManagerGateLogFilters({
  query,
  statusFilter,
  vehicleFilter,
  customerFilter,
  onQueryChange,
  onStatusFilterChange,
  onVehicleFilterChange,
  onCustomerFilterChange,
}: ManagerGateLogFiltersProps) {
  return (
    <div className="grid w-full min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-4">
      <Label className="grid min-w-0 gap-2 text-xs font-medium text-muted-foreground">
        Tìm biển số
        <Input
          className="h-10"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Ví dụ: 51G-882.14"
        />
      </Label>

      <Label className="grid min-w-0 gap-2 text-xs font-medium text-muted-foreground">
        Trạng thái
        <NativeSelect
          className="w-full"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as ManagerGateStatusFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="active">Trong bãi</option>
          <option value="completed">Đã ra</option>
        </NativeSelect>
      </Label>

      <Label className="grid min-w-0 gap-2 text-xs font-medium text-muted-foreground">
        Loại xe
        <NativeSelect
          className="w-full"
          value={vehicleFilter}
          onChange={(event) => onVehicleFilterChange(event.target.value as ManagerGateVehicleFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="motorcycle">Xe máy</option>
          <option value="car">Ô tô</option>
        </NativeSelect>
      </Label>

      <Label className="grid min-w-0 gap-2 text-xs font-medium text-muted-foreground">
        Loại khách
        <NativeSelect
          className="w-full"
          value={customerFilter}
          onChange={(event) => onCustomerFilterChange(event.target.value as ManagerGateCustomerFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="resident">Cư dân</option>
          <option value="walk_in">Khách vãng lai</option>
        </NativeSelect>
      </Label>
    </div>
  )
}
