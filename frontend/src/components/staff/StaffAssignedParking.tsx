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
  if (!customerType) {
    return (
      <div className="rounded-xl border border-dashed border-theme bg-badge p-4">
        <p className="text-sm font-semibold text-fg">Vị trí sẽ được xác định sau khi tra cứu</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Tra cứu biển số để hệ thống nhận diện cư dân hoặc khách vãng lai và áp dụng đúng cách phân bổ.
        </p>
      </div>
    )
  }

  if (vehicleType === 'car' && customerType === 'resident') {
    return (
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
        <p className="text-sm font-bold text-fg">Ô đỗ riêng theo gói cư dân</p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          Hệ thống giữ nguyên ô đỗ cố định mà cư dân đã thanh toán và tự xác định vị trí khi ghi nhận xe vào.
        </p>
      </div>
    )
  }

  if (vehicleType === 'car') {
    return (
      <div className="rounded-xl border border-sky-500/30 bg-sky-500/10 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-fg">Ô tô vãng lai tính sức chứa theo tầng</p>
            <p className="mt-1 max-w-2xl text-xs leading-relaxed text-muted">
              Không cấp ô đỗ cố định. Hệ thống tự chọn tầng khách còn chỗ và ghi nhận xe theo bộ đếm của tầng.
            </p>
          </div>
          <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-[10px] font-bold text-sky-700 dark:text-sky-200">
            Không cần chọn slot
          </span>
        </div>
        <p className="mt-3 border-t border-sky-500/20 pt-3 text-[11px] text-muted">
          Nếu tất cả tầng ô tô khách đã đầy, hệ thống sẽ từ chối check-in và báo bãi đầy.
        </p>
      </div>
    )
  }

  return (
    <StaffGateField label="Tầng gửi xe (không bắt buộc)">
      <select
        value={selectedFloorId}
        onChange={(event) => onFloorChange(event.target.value)}
        className="auth-input h-12 rounded-xl border px-3 text-sm text-fg"
      >
        <option value="">Để hệ thống tự chọn hàng còn chỗ</option>
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
        {customerType === 'resident' ? 'Xe máy cư dân' : 'Xe máy vãng lai'} được tính sức chứa theo hàng.
        Nhân viên có thể chọn tầng mong muốn hoặc để hệ thống tự chọn hàng còn chỗ.
      </p>
    </StaffGateField>
  )
}
