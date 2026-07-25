import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
import type {
  ManagerSubscriptionStatus,
  ManagerSubscriptionVehicleType,
} from '../../../services/managerSubscriptionsApi'

export type ManagerSubscriptionStatusFilter = ManagerSubscriptionStatus | 'all' | 'expiring'
export type ManagerSubscriptionVehicleFilter = ManagerSubscriptionVehicleType | 'all'
export type ManagerSubscriptionParkingFilter = 'all' | 'inside' | 'outside'

type ManagerSubscriptionPlanOption = {
  id: string
  label: string
}

type Props = {
  query: string
  status: ManagerSubscriptionStatusFilter
  vehicleType: ManagerSubscriptionVehicleFilter
  planId: string
  parkingStatus: ManagerSubscriptionParkingFilter
  planOptions: ManagerSubscriptionPlanOption[]
  hasActiveFilters: boolean
  onQueryChange: (value: string) => void
  onStatusChange: (value: ManagerSubscriptionStatusFilter) => void
  onVehicleTypeChange: (value: ManagerSubscriptionVehicleFilter) => void
  onPlanIdChange: (value: string) => void
  onParkingStatusChange: (value: ManagerSubscriptionParkingFilter) => void
  onReset: () => void
}

export function ManagerSubscriptionFilters({
  query,
  status,
  vehicleType,
  planId,
  parkingStatus,
  planOptions,
  hasActiveFilters,
  onQueryChange,
  onStatusChange,
  onVehicleTypeChange,
  onPlanIdChange,
  onParkingStatusChange,
  onReset,
}: Props) {
  return (
    <div className="grid gap-3 xl:grid-cols-[minmax(16rem,1.4fr)_repeat(4,minmax(9rem,1fr))_auto] xl:items-end">
      <Label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
        Tìm kiếm
        <Input
          type="search"
          className="h-10"
          value={query}
          placeholder="Tên, email, SĐT, biển số, gói hoặc vị trí"
          onChange={(event) => onQueryChange(event.target.value)}
        />
      </Label>

      <Label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
        Trạng thái gói
        <NativeSelect
          className="w-full"
          value={status}
          onChange={(event) => onStatusChange(event.target.value as ManagerSubscriptionStatusFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="active">Đang hoạt động</option>
          <option value="expiring">Sắp hết hạn</option>
          <option value="pending">Chờ thanh toán</option>
          <option value="expired">Đã hết hạn</option>
          <option value="cancelled">Đã hủy</option>
        </NativeSelect>
      </Label>

      <Label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
        Loại xe
        <NativeSelect
          className="w-full"
          value={vehicleType}
          onChange={(event) => onVehicleTypeChange(event.target.value as ManagerSubscriptionVehicleFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="motorcycle">Xe máy</option>
          <option value="car">Ô tô</option>
        </NativeSelect>
      </Label>

      <Label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
        Gói đăng ký
        <NativeSelect
          className="w-full"
          value={planId}
          onChange={(event) => onPlanIdChange(event.target.value)}
        >
          <option value="all">Tất cả gói</option>
          {planOptions.map((option) => (
            <option key={option.id} value={option.id}>
              {option.label}
            </option>
          ))}
        </NativeSelect>
      </Label>

      <Label className="grid gap-1.5 text-xs font-medium text-muted-foreground">
        Trạng thái trong bãi
        <NativeSelect
          className="w-full"
          value={parkingStatus}
          onChange={(event) => onParkingStatusChange(event.target.value as ManagerSubscriptionParkingFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="inside">Đang trong bãi</option>
          <option value="outside">Không trong bãi</option>
        </NativeSelect>
      </Label>

      <Button
        type="button"
        variant="outline"
        className="h-10 px-4"
        disabled={!hasActiveFilters}
        onClick={onReset}
      >
        Xóa bộ lọc
      </Button>
    </div>
  )
}
