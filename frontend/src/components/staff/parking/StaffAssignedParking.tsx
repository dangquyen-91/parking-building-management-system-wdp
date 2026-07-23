import type { GateCustomerType, GateVehicleType } from '../../../services/staffGateApi'
import type { StaffGateFloorOption } from '../../../utils/staffGateAllocation'
import { Badge } from '../../ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '../../ui/card'

type StaffAssignedParkingProps = {
  vehicleType: GateVehicleType
  customerType?: GateCustomerType
  floorOptions: StaffGateFloorOption[]
  selectedFloorId: string
  onFloorChange: (value: string) => void
}

export function StaffAssignedParking({
  vehicleType,
  customerType,
}: StaffAssignedParkingProps) {
  if (!customerType) {
    return (
      <Card className="border-dashed" size="sm">
        <CardHeader>
          <CardTitle>Vị trí sẽ được xác định sau khi tra cứu</CardTitle>
          <CardDescription>
            Tra cứu biển số để hệ thống nhận diện cư dân hoặc khách vãng lai và áp dụng đúng cách phân bổ.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (vehicleType === 'car' && customerType === 'resident') {
    return (
      <Card size="sm">
        <CardHeader>
          <CardTitle>Ô đỗ riêng theo gói cư dân</CardTitle>
          <CardDescription>
            Hệ thống giữ nguyên ô đỗ cố định mà cư dân đã thanh toán và tự xác định vị trí khi ghi nhận xe vào.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  if (vehicleType === 'car') {
    return (
      <Card size="sm">
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle>Ô tô vãng lai tính sức chứa theo tầng</CardTitle>
              <CardDescription>
                Không cấp ô đỗ cố định. Hệ thống tự chọn tầng khách còn chỗ và ghi nhận xe theo bộ đếm của tầng.
              </CardDescription>
            </div>
            <Badge variant="secondary">Không cần chọn slot</Badge>
          </div>
          <CardDescription>
            Nếu tất cả tầng ô tô khách đã đầy, hệ thống sẽ từ chối check-in và báo bãi đầy.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card size="sm">
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle>
              {customerType === 'resident' ? 'Xe máy cư dân tính sức chứa theo hàng' : 'Xe máy vãng lai tính sức chứa theo hàng'}
            </CardTitle>
            <CardDescription>
              Không cần chọn tầng hay slot. Hệ thống tự chọn hàng còn chỗ và ghi nhận xe theo bộ đếm của hàng.
            </CardDescription>
          </div>
          <Badge variant="secondary">Tự động phân bổ</Badge>
        </div>
        <CardDescription>
          Nếu tất cả hàng xe máy đã đầy, hệ thống sẽ từ chối check-in và báo bãi đầy.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}
