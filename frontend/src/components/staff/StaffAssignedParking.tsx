import type { GateCustomerType, GateVehicleType } from '../../services/staffGateApi'
import type { StaffGateFloorOption } from '../../utils/staffGateAllocation'
import { StaffGateField } from './StaffGateField'
import { getBuildingName } from './staffGateUtils'

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
  floorOptions,
  selectedFloorId,
  onFloorChange,
}: StaffAssignedParkingProps) {
  if (vehicleType === 'car' && customerType === 'resident') {
    return (
      <div className="rounded-lg border border-theme bg-badge p-4 text-sm text-muted">
        Cư dân ô tô sử dụng ô đỗ cố định trong gói cư dân. Hệ thống sẽ xác định vị trí khi ghi nhận xe vào.
      </div>
    )
  }

  return (
    <StaffGateField label="Tầng gửi xe">
      <select
        value={selectedFloorId}
        onChange={(event) => onFloorChange(event.target.value)}
        className="auth-input h-11 rounded-lg border px-3 text-sm text-fg"
      >
        <option value="">Chọn tầng còn chỗ</option>
        {floorOptions.map(({ floor, available }) => {
          const buildingName = getBuildingName(floor)
          return (
            <option key={floor._id} value={floor._id}>
              {buildingName ? `${buildingName} - ` : ''}Tầng {floor.floorNumber} - còn {available}/
              {floor.totalSlots} vị trí
            </option>
          )
        })}
      </select>
      <p className="mt-2 text-xs text-muted">
        Nhân viên chỉ chọn tầng. Hệ thống tự phân bổ {vehicleType === 'car' ? 'ô đỗ' : 'hàng đỗ'} còn chỗ bên trong.
      </p>
    </StaffGateField>
  )
}
