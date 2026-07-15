import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
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
    <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2 xl:w-auto xl:min-w-[32rem]">
      <Label className="grid min-w-0 gap-2 text-xs font-medium text-muted-foreground">
        Tìm biển số
        <Input
          className="h-10"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Ví dụ: 61K-424.94"
        />
      </Label>

      <Label className="grid min-w-0 gap-2 text-xs font-medium text-muted-foreground">
        Loại xe
        <NativeSelect
          className="w-full [&_[data-slot=native-select]]:h-10"
          value={vehicleFilter}
          onChange={(event) => onVehicleFilterChange(event.target.value as ManagerLostTicketVehicleFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="motorcycle">Xe máy</option>
          <option value="car">Ô tô</option>
        </NativeSelect>
      </Label>
    </div>
  )
}




