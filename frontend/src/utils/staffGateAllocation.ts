import type { Floor } from '../services/managerBuildingsApi'
import type {
  GateCustomerType,
  GateRow,
  GateSlot,
  GateVehicleType,
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
  vehicleType: GateVehicleType
  selectedFloorId: string
}

export type StaffGateFloorOption = {
  floor: Floor
  available: number
}

export function getStaffGateAllocation({
  rows,
  slots,
  floorMap,
  lookupMatchesPlate,
  customerType,
  vehicleType,
  selectedFloorId,
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

  const floorOptions = Array.from(floorMap.values())
    .filter((floor) => floor.vehicleType === vehicleType)
    .map((floor): StaffGateFloorOption => ({
      floor,
      available:
        vehicleType === 'motorcycle'
          ? rowOptions
              .filter((row) => getFloorId(row) === floor._id)
              .reduce((total, row) => total + Math.max(0, row.capacity - row.occupiedCount), 0)
          : slotOptions.filter((slot) => getFloorId(slot) === floor._id).length,
    }))
    .filter((option) => option.available > 0)
    .sort((a, b) => a.floor.floorNumber - b.floor.floorNumber)

  const autoAssignedRow = rowOptions.find((row) => getFloorId(row) === selectedFloorId)
  const autoAssignedSlot = slotOptions.find((slot) => getFloorId(slot) === selectedFloorId)
  const availableCount =
    rowOptions.reduce((total, row) => total + Math.max(0, row.capacity - row.occupiedCount), 0) +
    slotOptions.length

  return {
    rowOptions,
    floorOptions,
    autoAssignedRow,
    autoAssignedSlot,
    availableCount,
  }
}
