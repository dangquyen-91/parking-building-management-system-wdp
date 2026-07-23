type FloorLike = {
  floorNumber?: number | string | null
  section?: string | null
  vehicleType?: 'motorcycle' | 'car' | string | null
  floorType?: 'resident' | 'visitor' | string | null
}

export function getFloorSection(section?: string | null) {
  const normalized = section?.trim()
  return normalized ? normalized.toUpperCase() : 'A'
}

export function formatFloorLabel(floor: FloorLike) {
  const floorNumber = floor.floorNumber ?? '-'
  return `Tầng ${floorNumber} · Khu ${getFloorSection(floor.section)}`
}

export function formatFloorOptionLabel(floor: FloorLike) {
  const vehicleLabel = floor.vehicleType === 'motorcycle' ? 'Xe máy' : floor.vehicleType === 'car' ? 'Ô tô' : null
  const typeLabel = floor.floorType === 'resident' ? 'Cư dân' : floor.floorType === 'visitor' ? 'Khách vãng lai' : null
  const details = [vehicleLabel, typeLabel].filter(Boolean).join(' · ')

  return details ? `${formatFloorLabel(floor)} · ${details}` : formatFloorLabel(floor)
}
