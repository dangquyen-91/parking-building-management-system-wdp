import type { Floor } from '../../services/managerBuildingsApi'
import type {
  GateCustomerType,
  GateRow,
  GateSlot,
  GateVehicleType,
} from '../../services/staffGateApi'
import { getBuildingName, getFloorId } from './staffGateUtils'

type StaffAssignedParkingProps = {
  vehicleType: GateVehicleType
  customerType?: GateCustomerType
  autoAssignedRow?: GateRow
  autoAssignedRowFloorAvailable: number
  autoAssignedSlot?: GateSlot
  autoAssignedFloorAvailable: number
  floorMap: Map<string, Floor>
}

export function StaffAssignedParking({
  vehicleType,
  customerType,
  autoAssignedRow,
  autoAssignedRowFloorAvailable,
  autoAssignedSlot,
  autoAssignedFloorAvailable,
  floorMap,
}: StaffAssignedParkingProps) {
  if (vehicleType === 'motorcycle') {
    return (
      <AutoAssignedMotorcycleFloor
        row={autoAssignedRow}
        available={autoAssignedRowFloorAvailable}
        floorMap={floorMap}
      />
    )
  }

  if (customerType === 'resident') {
    return (
      <div className="rounded-lg border border-theme bg-badge p-4 text-sm text-muted">
        Cư dân ô tô sử dụng ô đỗ cố định trong gói cư dân. Hệ thống sẽ xác định vị trí khi check-in.
      </div>
    )
  }

  return (
    <AutoAssignedCarFloor
      slot={autoAssignedSlot}
      available={autoAssignedFloorAvailable}
      floorMap={floorMap}
    />
  )
}

function AutoAssignedMotorcycleFloor({
  row,
  available,
  floorMap,
}: {
  row?: GateRow
  available: number
  floorMap: Map<string, Floor>
}) {
  if (!row) {
    return <NoAvailableParking message="Hiện không còn vị trí xe máy phù hợp." />
  }

  const floor = floorMap.get(getFloorId(row))
  const buildingName = getBuildingName(floor)

  return (
    <AssignedFloor
      buildingName={buildingName}
      floorNumber={floor?.floorNumber}
      availability={`Còn trống ${available}/${floor?.totalSlots ?? '--'} vị trí xe máy. Hệ thống tự quản lý hàng đỗ bên trong.`}
    />
  )
}

function AutoAssignedCarFloor({
  slot,
  available,
  floorMap,
}: {
  slot?: GateSlot
  available: number
  floorMap: Map<string, Floor>
}) {
  if (!slot) {
    return <NoAvailableParking message="Hiện không còn vị trí ô tô dành cho khách vãng lai." />
  }

  const floor = floorMap.get(getFloorId(slot))
  const buildingName = getBuildingName(floor)

  return (
    <AssignedFloor
      buildingName={buildingName}
      floorNumber={floor?.floorNumber}
      availability={`Còn trống ${available}/${floor?.totalSlots ?? '--'} vị trí ô tô. Hệ thống tự quản lý slot bên trong.`}
    />
  )
}

function AssignedFloor({
  buildingName,
  floorNumber,
  availability,
}: {
  buildingName?: string
  floorNumber?: number
  availability: string
}) {
  return (
    <div className="rounded-lg border border-theme bg-badge p-4 text-sm">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">Tầng hệ thống phân bổ</p>
      <p className="mt-2 font-semibold text-fg">
        {buildingName ? `${buildingName} · ` : ''}Tầng {floorNumber ?? '--'}
      </p>
      <p className="mt-1 text-xs text-muted">{availability}</p>
    </div>
  )
}

function NoAvailableParking({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-200">
      {message}
    </div>
  )
}
