import type { Floor } from '../../services/managerBuildingsApi'
import type {
  GateCustomerType,
  GateRow,
  GateSession,
  GateSlot,
  GateVehicleType,
} from '../../services/staffGateApi'

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

export function formatSessionSpot(session: GateSession) {
  if (session.slotId && typeof session.slotId !== 'string') {
    return session.slotId.slotCode
  }

  if (session.rowId && typeof session.rowId !== 'string') {
    const row = session.rowId
    return `${row.rowCode} (${row.occupiedCount}/${row.capacity})`
  }

  return 'Tự động'
}
