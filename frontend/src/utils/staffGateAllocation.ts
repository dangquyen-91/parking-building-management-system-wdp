import type { Floor } from '../services/managerBuildingsApi'
import type {
  GateCustomerType,
  GateRow,
  GateSlot,
} from '../services/staffGateApi'

function getFloorId(value: GateRow | GateSlot) {
  return typeof value.floorId === 'string' ? value.floorId : value.floorId?._id
}

type StaffGateAllocationParams = {
  rows: GateRow[]
  slots: GateSlot[]
  floorMap: Map<string, Floor>
  lookupMatchesPlate: boolean
  customerType?: GateCustomerType
}

export function getStaffGateAllocation({
  rows,
  slots,
  floorMap,
  lookupMatchesPlate,
  customerType,
}: StaffGateAllocationParams) {
  const targetFloorType = customerType === 'resident' ? 'resident' : 'visitor'

  const rowOptions = rows.filter((row) => {
    const floor = floorMap.get(getFloorId(row))
    if (!floor || floor.vehicleType !== 'motorcycle') return false
    if (lookupMatchesPlate && floor.floorType !== targetFloorType) return false
    return row.status === 'available' && row.occupiedCount < row.capacity
  })

  const slotOptions = slots.filter((slot) => {
    const floor = floorMap.get(getFloorId(slot))
    if (!floor || floor.vehicleType !== 'car') return false
    if (lookupMatchesPlate && floor.floorType !== 'visitor') return false
    return slot.status === 'empty'
  })

  const autoAssignedRow = rowOptions[0]
  const autoAssignedRowFloorId = autoAssignedRow ? getFloorId(autoAssignedRow) : undefined
  const autoAssignedRowFloorAvailable = autoAssignedRowFloorId
    ? rowOptions
        .filter((row) => getFloorId(row) === autoAssignedRowFloorId)
        .reduce((total, row) => total + Math.max(0, row.capacity - row.occupiedCount), 0)
    : 0
  const autoAssignedSlot = slotOptions[0]
  const autoAssignedFloorId = autoAssignedSlot ? getFloorId(autoAssignedSlot) : undefined
  const autoAssignedFloorAvailable = autoAssignedFloorId
    ? slotOptions.filter((slot) => getFloorId(slot) === autoAssignedFloorId).length
    : 0
  const availableCount =
    rowOptions.reduce((total, row) => total + Math.max(0, row.capacity - row.occupiedCount), 0) +
    slotOptions.length

  return {
    rowOptions,
    autoAssignedRow,
    autoAssignedRowFloorAvailable,
    autoAssignedSlot,
    autoAssignedFloorAvailable,
    availableCount,
  }
}
