import { useCallback, useEffect, useRef, useState } from 'react'
import { managerBuildingsApi, type Building, type Floor } from '../services/managerBuildingsApi'
import { parkingRowApi, type ParkingRow } from '../services/managerParkingRowApi'
import { parkingSlotApi, type ParkingSlot } from '../services/managerParkingSlotApi'

export function useManagerParkingSpaces() {
  const [slots, setSlots] = useState<ParkingSlot[]>([])
  const [rows, setRows] = useState<ParkingRow[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const reloadSlots = useCallback(async () => {
    const response = await parkingSlotApi.getSlots({ limit: 200, sortBy: 'slotCode', sortOrder: 'asc' })
    if (!isMountedRef.current) return
    setSlots(response.slots ?? [])
  }, [])

  const reloadRows = useCallback(async () => {
    const response = await parkingRowApi.getRows({ limit: 200, sortBy: 'rowCode', sortOrder: 'asc' })
    if (!isMountedRef.current) return
    setRows(response.rows ?? [])
  }, [])

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [slotsResponse, rowsResponse, floorsResponse, buildingsResponse] = await Promise.all([
        parkingSlotApi.getSlots({ limit: 200, sortBy: 'slotCode', sortOrder: 'asc' }),
        parkingRowApi.getRows({ limit: 200, sortBy: 'rowCode', sortOrder: 'asc' }),
        managerBuildingsApi.getFloors({ limit: 200, sort: 'floorNumber', order: 'asc' }),
        managerBuildingsApi.getBuildings({ limit: 200, sort: 'name', order: 'asc' }),
      ])

      if (!isMountedRef.current) return

      setSlots(slotsResponse.slots ?? [])
      setRows(rowsResponse.rows ?? [])
      setFloors(floorsResponse.floors ?? [])
      setBuildings(buildingsResponse.buildings ?? [])
    } catch (err) {
      if (!isMountedRef.current) return
      setError(err instanceof Error ? err.message : 'Không thể tải dữ liệu chỗ đỗ.')
    } finally {
      if (!isMountedRef.current) return
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  return {
    slots,
    rows,
    floors,
    buildings,
    isLoading,
    error,
    setError,
    reloadSlots,
    reloadRows,
  }
}
