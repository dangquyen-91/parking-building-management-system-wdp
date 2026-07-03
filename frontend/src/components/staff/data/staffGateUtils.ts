import type { Floor } from '../../../services/managerBuildingsApi'
import type {
  GateCustomerType,
  GateRow,
  GateSession,
  GateSlot,
  GateVehicleType,
} from '../../../services/staffGateApi'
import { getFloorSection } from '../../../utils/floorLabel'

export function normalizePlate(value: string) {
  return value.trim().toUpperCase().replace(/\s/g, '')
}

export function formatCustomerType(value: GateCustomerType) {
  return value === 'resident' ? 'Cư dân' : 'Khách vãng lai'
}

export function formatVehicleType(value: GateVehicleType) {
  return value === 'car' ? 'Ô tô' : 'Xe máy'
}

export function getFloorId(value: GateRow | GateSlot) {
  return typeof value.floorId === 'string' ? value.floorId : value.floorId?._id
}

export function getBuildingName(floor?: Floor) {
  const building = floor?.buildingId
  return typeof building === 'string' ? undefined : building?.name
}

export function formatSessionSpot(session: GateSession, floorMap?: Map<string, Floor>) {
  if (session.customerType === 'walk_in') {
    return 'Tự động'
  }

  if (session.slotId && typeof session.slotId !== 'string') {
    return formatDetailedSpot(session.slotId.floorId, `Ô đỗ ${session.slotId.slotCode}`, floorMap)
  }

  if (session.rowId && typeof session.rowId !== 'string') {
    const row = session.rowId
    return formatDetailedSpot(
      row.floorId,
      `Hàng ${row.rowCode} (${row.occupiedCount}/${row.capacity})`,
      floorMap,
    )
  }

  return 'Tự động'
}

function formatDetailedSpot(
  floorRef: GateRow['floorId'] | GateSlot['floorId'],
  spot: string,
  floorMap?: Map<string, Floor>,
) {
  const floorId = typeof floorRef === 'string' ? floorRef : floorRef?._id
  const loadedFloor = floorMap?.get(floorId)
  const populatedFloor = typeof floorRef === 'string' ? undefined : floorRef
  const floorNumber = loadedFloor?.floorNumber ?? populatedFloor?.floorNumber
  const section = loadedFloor?.section ?? populatedFloor?.section
  const buildingName = getBuildingName(loadedFloor)

  return [
    buildingName,
    floorNumber === undefined ? undefined : `Tầng ${floorNumber}`,
    section ? `Khu ${getFloorSection(section)}` : undefined,
    spot,
  ].filter(Boolean).join(' · ')
}
