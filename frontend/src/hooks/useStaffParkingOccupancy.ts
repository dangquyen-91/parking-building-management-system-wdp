import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { managerBuildingsApi, type Floor } from '../services/managerBuildingsApi'
import { managerBookingsApi, type ManagerBooking } from '../services/managerBookingsApi'
import { staffGateApi, type GateRow, type GateSession, type GateSlot, type GateVehicleType } from '../services/staffGateApi'

export type StaffParkingOccupancyItem = {
  key: string
  buildingName: string
  floorNumber: number
  section?: string
  vehicleType: GateVehicleType
  floorType?: Floor['floorType']
  total: number
  occupied: number
  reserved: number
  available: number
  utilizationPercent: number
  slotDetails: Array<{
    id: string
    code: string
    status: GateSlot['status']
    licensePlate?: string
  }>
  rowDetails: Array<{
    id: string
    code: string
    status: GateRow['status']
    capacity: number
    occupied: number
  }>
}

export function useStaffParkingOccupancy() {
  const [floors, setFloors] = useState<Floor[]>([])
  const [rows, setRows] = useState<GateRow[]>([])
  const [slots, setSlots] = useState<GateSlot[]>([])
  const [sessions, setSessions] = useState<GateSession[]>([])
  const [bookings, setBookings] = useState<ManagerBooking[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const isMountedRef = useRef(true)

  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const occupancyItems = useMemo<StaffParkingOccupancyItem[]>(() => {
    const slotGroups = new Map<string, { total: number; occupied: number; available: number }>()
    const rowGroups = new Map<string, { total: number; occupied: number }>()

    slots.forEach((slot) => {
      const floorId = getRefId(slot.floorId)
      if (!floorId) return

      const current = slotGroups.get(floorId) ?? { total: 0, occupied: 0, available: 0 }
      current.total += 1
      if (slot.status === 'occupied') current.occupied += 1
      if (slot.status === 'empty') current.available += 1
      slotGroups.set(floorId, current)
    })

    rows.forEach((row) => {
      const floorId = getRefId(row.floorId)
      if (!floorId) return

      const current = rowGroups.get(floorId) ?? { total: 0, occupied: 0 }
      current.total += row.capacity
      current.occupied += row.occupiedCount
      rowGroups.set(floorId, current)
    })

    // Walk-in cars are counter-based on the floor (no fixed slot) → count active
    // car sessions by floorId so visitor car floors show real occupancy.
    const walkInCarByFloor = new Map<string, number>()
    const activeSessionBySlot = new Map<string, GateSession>()
    sessions.forEach((session) => {
      if (session.status !== 'active') return
      const slotId = getRefId(session.slotId)
      if (slotId) activeSessionBySlot.set(slotId, session)
      if (session.vehicleType !== 'car') return
      const floorId = getRefId(session.floorId)
      if (!floorId) return
      walkInCarByFloor.set(floorId, (walkInCarByFloor.get(floorId) ?? 0) + 1)
    })

    // Paid bookings hold a spot from the moment they're paid, not just once the
    // car checks in. A booking isn't pinned to one floor (capacity is checked in
    // aggregate across all visitor car floors — see booking.service.js), so
    // spread the count currently "in window" proportionally by floor size.
    const now = Date.now()
    const reservedNow = bookings.filter((booking) => {
      if (booking.status !== 'paid') return false
      const arrival = new Date(booking.expectedArrivalTime).getTime()
      const exit = new Date(booking.expectedExitTime).getTime()
      return arrival <= now && exit > now
    }).length
    const visitorCarFloors = floors.filter(
      (floor) => floor.vehicleType === 'car' && floor.floorType === 'visitor',
    )
    const reservedByFloor = distributeProportionally(
      reservedNow,
      visitorCarFloors.map((floor) => ({ id: floor._id, weight: floor.totalSlots || 1 })),
    )

    return floors
      .map((floor) => {
        const building = typeof floor.buildingId === 'string' ? undefined : floor.buildingId
        const rowStats = rowGroups.get(floor._id)
        const slotStats = slotGroups.get(floor._id)
        const total =
          floor.vehicleType === 'motorcycle'
            ? rowStats?.total || floor.totalSlots || 0
            : slotStats?.total || floor.totalSlots || 0
        const reserved = reservedByFloor.get(floor._id) ?? 0
        const occupied =
          floor.vehicleType === 'motorcycle'
            ? rowStats?.occupied ?? 0
            : (slotStats?.occupied ?? 0) + (walkInCarByFloor.get(floor._id) ?? 0) + reserved
        const available = Math.max(0, total - occupied)

        return {
          key: floor._id,
          buildingName: building?.name || 'Tòa nhà',
          floorNumber: floor.floorNumber,
          section: floor.section,
          vehicleType: floor.vehicleType,
          floorType: floor.floorType,
          total,
          occupied,
          reserved,
          available,
          utilizationPercent: total > 0 ? Math.round((occupied / total) * 100) : 0,
          slotDetails:
            floor.vehicleType === 'car' && floor.floorType === 'resident'
              ? slots
                  .filter((slot) => getRefId(slot.floorId) === floor._id)
                  .map((slot) => ({
                    id: slot._id,
                    code: slot.slotCode,
                    status: slot.status,
                    licensePlate: activeSessionBySlot.get(slot._id)?.licensePlate,
                  }))
              : [],
          rowDetails:
            floor.vehicleType === 'motorcycle'
              ? rows
                  .filter((row) => getRefId(row.floorId) === floor._id)
                  .map((row) => ({
                    id: row._id,
                    code: row.rowCode,
                    status: row.status,
                    capacity: row.capacity,
                    occupied: row.occupiedCount,
                  }))
              : [],
        }
      })
      .filter((item) => item.total > 0)
      .sort((a, b) =>
        a.buildingName.localeCompare(b.buildingName)
        || a.floorNumber - b.floorNumber
        || (a.section || '').localeCompare(b.section || '')
        || a.vehicleType.localeCompare(b.vehicleType),
      )
  }, [floors, rows, slots, sessions, bookings])

  const totals = useMemo(
    () => ({
      total: occupancyItems.reduce((sum, item) => sum + item.total, 0),
      occupied: occupancyItems.reduce((sum, item) => sum + item.occupied, 0),
      reserved: occupancyItems.reduce((sum, item) => sum + item.reserved, 0),
      available: occupancyItems.reduce((sum, item) => sum + item.available, 0),
    }),
    [occupancyItems],
  )

  const reload = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const [floorResponse, rowResponse, slotResponse, sessionResponse, bookingResponse] = await Promise.all([
        managerBuildingsApi.getFloors({ limit: 300, sort: 'floorNumber', order: 'asc' }),
        staffGateApi.getRows({ limit: 500 }),
        staffGateApi.getSlots({ limit: 500 }),
        staffGateApi.getActiveSessions({ limit: 500 }),
        managerBookingsApi.getBookings({ status: 'paid', limit: 500 }),
      ])

      if (!isMountedRef.current) return
      setFloors(floorResponse.floors ?? [])
      setRows(rowResponse.rows ?? [])
      setSlots(slotResponse.slots ?? [])
      setSessions(sessionResponse.sessions ?? [])
      setBookings(bookingResponse.bookings ?? [])
    } catch (err) {
      if (!isMountedRef.current) return
      setError(err instanceof Error ? err.message : 'Không tải được dữ liệu sức chứa bãi xe.')
    } finally {
      if (isMountedRef.current) setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void reload(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [reload])

  return {
    occupancyItems,
    totals,
    isLoading,
    error,
    reload,
  }
}

function getRefId(ref: string | { _id?: string } | null | undefined) {
  return typeof ref === 'string' ? ref : ref?._id
}

// Largest-remainder rounding so the per-floor counts always sum back to `total`.
function distributeProportionally(
  total: number,
  weights: Array<{ id: string; weight: number }>,
): Map<string, number> {
  const result = new Map<string, number>()
  const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0)
  if (total <= 0 || totalWeight <= 0) return result

  const shares = weights.map((w) => {
    const exact = (w.weight / totalWeight) * total
    const base = Math.floor(exact)
    return { id: w.id, base, remainder: exact - base }
  })

  let remaining = total - shares.reduce((sum, s) => sum + s.base, 0)
  shares
    .slice()
    .sort((a, b) => b.remainder - a.remainder)
    .forEach((s) => {
      if (remaining > 0) {
        s.base += 1
        remaining -= 1
      }
    })

  shares.forEach((s) => result.set(s.id, s.base))
  return result
}
