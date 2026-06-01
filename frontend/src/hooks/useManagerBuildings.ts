import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { managerBuildingsApi, type Building, type Floor } from '../services/managerBuildingsApi'

export type ManagerFloorSummary = {
  id: string
  buildingId: string
  floorNumber: number
  vehicleType: Floor['vehicleType']
  floorType: Floor['floorType']
  totalSlots: number
  isActive: boolean
  description?: string
}

export type ManagerBuildingSummary = {
  id: string
  name: string
  address: string
  description?: string
  isActive: boolean
  floors: ManagerFloorSummary[]
  floorCount: number
  activeFloors: number
  totalSlots: number
}

type ManagerTotals = {
  buildings: number
  floors: number
  activeFloors: number
  slots: number
}

function getFloorBuildingId(floor: Floor) {
  if (typeof floor.buildingId === 'string') return floor.buildingId
  return floor.buildingId?._id
}

function buildSummaries(buildings: Building[], floors: Floor[]): ManagerBuildingSummary[] {
  return buildings.map((building) => {
    const buildingFloors = floors
      .filter((floor) => getFloorBuildingId(floor) === building._id)
      .map((floor) => ({
        id: floor._id,
        buildingId: getFloorBuildingId(floor) ?? '',
        floorNumber: floor.floorNumber,
        vehicleType: floor.vehicleType,
        floorType: floor.floorType,
        totalSlots: floor.totalSlots ?? 0,
        isActive: floor.isActive ?? true,
        description: floor.description,
      }))
      .sort((a, b) => a.floorNumber - b.floorNumber)

    const totalSlots = buildingFloors.reduce((sum, floor) => sum + floor.totalSlots, 0)
    const activeFloors = buildingFloors.filter((floor) => floor.isActive).length

    return {
      id: building._id,
      name: building.name,
      address: building.address,
      description: building.description,
      isActive: building.isActive ?? true,
      floors: buildingFloors,
      floorCount: buildingFloors.length,
      activeFloors,
      totalSlots,
    }
  })
}

export function useManagerBuildings() {
  const [buildings, setBuildings] = useState<Building[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [buildingResponse, floorResponse] = await Promise.all([
        managerBuildingsApi.getBuildings({ limit: 100, order: 'asc', sort: 'name' }),
        managerBuildingsApi.getFloors({ limit: 200, order: 'asc', sort: 'floorNumber' }),
      ])

      if (!isMountedRef.current) return

      setBuildings(buildingResponse.buildings ?? [])
      setFloors(floorResponse.floors ?? [])
    } catch (err) {
      if (!isMountedRef.current) return
      setError(err instanceof Error ? err.message : 'Khong the tai du lieu building.')
    } finally {
      if (!isMountedRef.current) return
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const summaries = useMemo(() => buildSummaries(buildings, floors), [buildings, floors])

  const totals = useMemo<ManagerTotals>(() => {
    return summaries.reduce(
      (acc, building) => {
        acc.floors += building.floorCount
        acc.activeFloors += building.activeFloors
        acc.slots += building.totalSlots
        return acc
      },
      {
        buildings: summaries.length,
        floors: 0,
        activeFloors: 0,
        slots: 0,
      },
    )
  }, [summaries])

  return {
    summaries,
    totals,
    isLoading,
    error,
    reload: loadData,
  }
}
