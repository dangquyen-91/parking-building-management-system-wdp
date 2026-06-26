type FloorLike = {
  floorNumber?: number | string | null
  section?: string | null
}

export function getFloorSection(section?: string | null) {
  const normalized = section?.trim()
  return normalized ? normalized.toUpperCase() : 'A'
}

export function formatFloorLabel(floor: FloorLike) {
  const floorNumber = floor.floorNumber ?? '-'
  return `Tầng ${floorNumber} / Khu ${getFloorSection(floor.section)}`
}
