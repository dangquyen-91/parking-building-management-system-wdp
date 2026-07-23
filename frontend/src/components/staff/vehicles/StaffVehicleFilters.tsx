import { RotateCcw } from 'lucide-react'
import type { StaffCustomerFilter, StaffVehicleFilter } from '../../../hooks/useStaffVehicles'
import { Button } from '../../ui/button'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { NativeSelect } from '../../ui/native-select'

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
      <Label className="grid gap-2 text-xs text-muted-foreground">
        Tìm kiếm nhanh
        <Input
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Biển số"
          className="uppercase tracking-wide"
        />
      </Label>

      <Label className="grid gap-2 text-xs text-muted-foreground">
        Loại xe
        <NativeSelect
          value={vehicleFilter}
          onChange={(event) => onVehicleFilterChange(event.target.value as StaffVehicleFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="motorcycle">Xe máy</option>
          <option value="car">Ô tô</option>
        </NativeSelect>
      </Label>

      <Label className="grid gap-2 text-xs text-muted-foreground">
        Loại khách
        <NativeSelect
          value={customerFilter}
          onChange={(event) => onCustomerFilterChange(event.target.value as StaffCustomerFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="resident">Cư dân</option>
          <option value="walk_in">Khách vãng lai</option>
        </NativeSelect>
      </Label>

      <Button
        type="button"
        variant="outline"
        disabled={!hasFilters}
        onClick={() => {
          onQueryChange('')
          onVehicleFilterChange('all')
          onCustomerFilterChange('all')
        }}
      >
        <RotateCcw className="size-4" />
        Xóa bộ lọc
      </Button>
    </div>
  )
}
