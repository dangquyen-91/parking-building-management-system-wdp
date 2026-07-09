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
    <div className="grid w-full gap-3 md:grid-cols-2 xl:w-auto xl:min-w-[34rem]">
      <Label className="grid gap-1 text-xs font-medium text-muted-foreground">
        Tìm biển số
        <Input
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-ring"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Ví dụ: 61K-424.94"
        />
      </Label>

      <Label className="grid gap-1 text-xs font-medium text-muted-foreground">
        Loại xe
        <NativeSelect
          className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
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




