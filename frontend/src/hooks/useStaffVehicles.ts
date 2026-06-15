import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { formatSessionSpot } from '../components/staff/staffGateUtils'
import { managerBuildingsApi, type Floor } from '../services/managerBuildingsApi'
import {
  staffGateApi,
  type GateCustomerType,
  type GateSession,
  type GateVehicleType,
} from '../services/staffGateApi'

export type StaffVehicleFilter = 'all' | GateVehicleType
export type StaffCustomerFilter = 'all' | GateCustomerType

export function useStaffVehicles() {
  const [sessions, setSessions] = useState<GateSession[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [query, setQuery] = useState('')
  const [vehicleFilter, setVehicleFilter] = useState<StaffVehicleFilter>('all')
  const [customerFilter, setCustomerFilter] = useState<StaffCustomerFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const floorMap = useMemo(() => new Map(floors.map((floor) => [floor._id, floor])), [floors])

  const filteredSessions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return sessions.filter((session) => {
      if (vehicleFilter !== 'all' && session.vehicleType !== vehicleFilter) return false
      if (customerFilter !== 'all' && session.customerType !== customerFilter) return false
      if (!normalizedQuery) return true

      return [session.licensePlate, session._id, formatSessionSpot(session, floorMap)].some((value) =>
        value.toLowerCase().includes(normalizedQuery),
      )
    })
  }, [customerFilter, floorMap, query, sessions, vehicleFilter])

  const stats = useMemo(
    () => [
      { label: 'Tổng xe đang gửi', value: sessions.length },
      { label: 'Xe máy', value: sessions.filter((session) => session.vehicleType === 'motorcycle').length },
      { label: 'Ô tô', value: sessions.filter((session) => session.vehicleType === 'car').length },
      { label: 'Khách vãng lai', value: sessions.filter((session) => session.customerType === 'walk_in').length },
    ],
    [sessions],
  )

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [sessionResponse, floorResponse] = await Promise.all([
        staffGateApi.getActiveSessions({ limit: 200 }),
        managerBuildingsApi.getFloors({ limit: 200, sort: 'floorNumber', order: 'asc' }),
      ])

      if (!isMountedRef.current) return
      setSessions(sessionResponse.sessions ?? [])
      setFloors(floorResponse.floors ?? [])
    } catch (err) {
      if (!isMountedRef.current) return
      setError(err instanceof Error ? err.message : 'Không tải được danh sách xe đang gửi.')
    } finally {
      if (isMountedRef.current) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void reload(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [reload])

  return {
    filteredSessions,
    stats,
    floorMap,
    query,
    vehicleFilter,
    customerFilter,
    isLoading,
    error,
    setQuery,
    setVehicleFilter,
    setCustomerFilter,
    reload,
  }
}
