import { useMemo, useState } from 'react'
import type { Building, Floor } from '../services/managerBuildingsApi'
import type { ParkingRow } from '../services/managerParkingRowApi'
import type { ParkingSlot } from '../services/managerParkingSlotApi'
import { getFloorSection } from '../utils/floorLabel'

type ParkingSpaceStats = {
  totalSlots: number
  totalRows: number
  maintenanceSlots: number
  occupiedSlots: number
  rowCapacity: number
  rowOccupied: number
}

function getFloorBuildingId(floor?: Floor) {
  if (!floor) return undefined
  if (typeof floor.buildingId === 'string') return floor.buildingId
  return floor.buildingId?._id
}

function getSlotFloorId(slot: ParkingSlot) {
  if (typeof slot.floorId === 'string') return slot.floorId
  return slot.floorId?._id
}

function getRowFloorId(row: ParkingRow) {
  if (typeof row.floorId === 'string') return row.floorId
  return row.floorId?._id
}

function compareSlotCodes(a: ParkingSlot, b: ParkingSlot) {
  return a.slotCode.localeCompare(b.slotCode, undefined, { numeric: true, sensitivity: 'base' })
}

function compareRowCodes(a: ParkingRow, b: ParkingRow) {
  return a.rowCode.localeCompare(b.rowCode, undefined, { numeric: true, sensitivity: 'base' })
}

function compareFloors(a: Floor, b: Floor) {
  return (
    (a.floorNumber ?? 0) - (b.floorNumber ?? 0) ||
    getFloorSection(a.section).localeCompare(getFloorSection(b.section), undefined, {
      numeric: true,
      sensitivity: 'base',
    })
  )
}

function groupSlotsByFloor(slots: ParkingSlot[]) {
  const map = new Map<string, ParkingSlot[]>()

  slots.forEach((slot) => {
    const floorId = getSlotFloorId(slot)
    if (!floorId) return
    const list = map.get(floorId) ?? []
    list.push(slot)
    map.set(floorId, list)
  })

  map.forEach((list) => list.sort(compareSlotCodes))
  return map
}

function groupRowsByFloor(rows: ParkingRow[]) {
  const map = new Map<string, ParkingRow[]>()

  rows.forEach((row) => {
    const floorId = getRowFloorId(row)
    if (!floorId) return
    const list = map.get(floorId) ?? []
    list.push(row)
    map.set(floorId, list)
  })

  map.forEach((list) => list.sort(compareRowCodes))
  return map
}

export function useParkingSpaceFilters({
  slots,
  rows,
  floors,
  buildings,
}: {
  slots: ParkingSlot[]
  rows: ParkingRow[]
  floors: Floor[]
  buildings: Building[]
}) {
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [floorNumberFilter, setFloorNumberFilter] = useState('all')
  const [sectionFilter, setSectionFilter] = useState('all')

  const buildingMap = useMemo(() => new Map(buildings.map((building) => [building._id, building])), [buildings])

  const filteredFloorOptions = useMemo(() => {
    return floors
      .filter((floor) => {
        const buildingId = getFloorBuildingId(floor)
        if (buildingFilter !== 'all' && buildingId !== buildingFilter) return false
        return true
      })
      .sort(compareFloors)
  }, [floors, buildingFilter])

  const floorNumberOptions = useMemo(() => {
    return Array.from(new Set(filteredFloorOptions.map((floor) => floor.floorNumber)))
      .filter((floorNumber): floorNumber is number => typeof floorNumber === 'number')
      .sort((a, b) => a - b)
  }, [filteredFloorOptions])

  const sectionOptions = useMemo(() => {
    return filteredFloorOptions
      .filter((floor) => floorNumberFilter === 'all' || String(floor.floorNumber) === floorNumberFilter)
      .sort(compareFloors)
  }, [filteredFloorOptions, floorNumberFilter])

  const selectedFloorIds = useMemo(() => {
    return new Set(
      filteredFloorOptions
        .filter((floor) => {
          if (floorNumberFilter !== 'all' && String(floor.floorNumber) !== floorNumberFilter) return false
          if (sectionFilter !== 'all' && floor._id !== sectionFilter) return false
          return true
        })
        .map((floor) => floor._id),
    )
  }, [filteredFloorOptions, floorNumberFilter, sectionFilter])

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const floorId = getSlotFloorId(slot)
      if (!floorId) return false
      return selectedFloorIds.has(floorId)
    })
  }, [slots, selectedFloorIds])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const floorId = getRowFloorId(row)
      if (!floorId) return false
      return selectedFloorIds.has(floorId)
    })
  }, [rows, selectedFloorIds])

  const slotsByFloor = useMemo(() => groupSlotsByFloor(filteredSlots), [filteredSlots])
  const rowsByFloor = useMemo(() => groupRowsByFloor(filteredRows), [filteredRows])

  const visibleSlotFloors = useMemo(() => {
    return filteredFloorOptions.filter((floor) => selectedFloorIds.has(floor._id) && slotsByFloor.has(floor._id)).sort(compareFloors)
  }, [filteredFloorOptions, selectedFloorIds, slotsByFloor])

  const visibleRowFloors = useMemo(() => {
    return filteredFloorOptions.filter((floor) => selectedFloorIds.has(floor._id) && rowsByFloor.has(floor._id)).sort(compareFloors)
  }, [filteredFloorOptions, selectedFloorIds, rowsByFloor])

  const stats = useMemo<ParkingSpaceStats>(() => {
    return {
      totalSlots: filteredSlots.length,
      totalRows: filteredRows.length,
      maintenanceSlots: filteredSlots.filter((slot) => slot.status === 'maintenance').length,
      occupiedSlots: filteredSlots.filter((slot) => slot.status === 'occupied').length,
      rowCapacity: filteredRows.reduce((total, row) => total + row.capacity, 0),
      rowOccupied: filteredRows.reduce((total, row) => total + row.occupiedCount, 0),
    }
  }, [filteredSlots, filteredRows])

  function handleBuildingFilterChange(value: string) {
    setBuildingFilter(value)
    setFloorNumberFilter('all')
    setSectionFilter('all')
  }

  function handleFloorNumberFilterChange(value: string) {
    setFloorNumberFilter(value)
    setSectionFilter('all')
  }

  return {
    buildingFilter,
    floorFilter: sectionFilter,
    floorNumberFilter,
    sectionFilter,
    setBuildingFilter: handleBuildingFilterChange,
    setFloorFilter: setSectionFilter,
    setFloorNumberFilter: handleFloorNumberFilterChange,
    setSectionFilter,
    filteredSlots,
    filteredRows,
    slotsByFloor,
    rowsByFloor,
    visibleSlotFloors,
    visibleRowFloors,
    filteredFloorOptions,
    floorNumberOptions,
    sectionOptions,
    buildingMap,
    stats,
  }
}
