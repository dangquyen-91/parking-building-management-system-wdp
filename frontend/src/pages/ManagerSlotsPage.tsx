import { useEffect, useMemo, useState } from 'react'
import { ManagerPageHeader, ManagerStatCard } from '../components/manager'
import { ManagerSlotGridSection } from '../components/manager/ManagerSlotGridSection'
import { ManagerSlotFormModal } from '../components/manager/ManagerSlotFormModal'
import { managerBuildingsApi, type Building, type Floor } from '../services/managerBuildingsApi'
import { parkingSlotApi, type ParkingSlot, type SlotBulkCreatePayload, type SlotUpdatePayload } from '../services/managerParkingSlotApi'

export function ManagerSlotsPage() {
  const [slots, setSlots] = useState<ParkingSlot[]>([])
  const [floors, setFloors] = useState<Floor[]>([])
  const [buildings, setBuildings] = useState<Building[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [activeSlot, setActiveSlot] = useState<ParkingSlot | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [floorFilter, setFloorFilter] = useState('all')

  useEffect(() => {
    let isMounted = true

    async function loadData() {
      setIsLoading(true)
      setError(null)

      try {
        const [slotsResponse, floorsResponse, buildingsResponse] = await Promise.all([
          parkingSlotApi.getSlots({ limit: 200, sortBy: 'slotCode', sortOrder: 'asc' }),
          managerBuildingsApi.getFloors({ limit: 200, sort: 'floorNumber', order: 'asc' }),
          managerBuildingsApi.getBuildings({ limit: 200, sort: 'name', order: 'asc' }),
        ])

        if (!isMounted) return

        setSlots(slotsResponse.slots ?? [])
        setFloors(floorsResponse.floors ?? [])
        setBuildings(buildingsResponse.buildings ?? [])
      } catch (err) {
        if (!isMounted) return
        setError(err instanceof Error ? err.message : 'Failed to load parking slots.')
      } finally {
        if (!isMounted) return
        setIsLoading(false)
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const floorMap = useMemo(() => {
    return new Map(floors.map((floor) => [floor._id, floor]))
  }, [floors])

  const buildingMap = useMemo(() => {
    return new Map(buildings.map((building) => [building._id, building]))
  }, [buildings])

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const floorId = typeof slot.floorId === 'string' ? slot.floorId : slot.floorId?._id
      const floor = floorId ? floorMap.get(floorId) : undefined
      const buildingId = typeof floor?.buildingId === 'string' ? floor?.buildingId : floor?.buildingId?._id

      if (buildingFilter !== 'all' && buildingId !== buildingFilter) return false
      if (floorFilter !== 'all' && floorId !== floorFilter) return false

      return true
    })
  }, [slots, floorMap, buildingFilter, floorFilter])

  const totalSlots = filteredSlots.length
  const maintenanceSlots = filteredSlots.filter((slot) => slot.status === 'maintenance').length
  const occupiedSlots = filteredSlots.filter((slot) => slot.status === 'occupied').length

  function compareSlotCodes(a: ParkingSlot, b: ParkingSlot) {
    return a.slotCode.localeCompare(b.slotCode, undefined, { numeric: true, sensitivity: 'base' })
  }

  const slotsByFloor = useMemo(() => {
    const map = new Map<string, ParkingSlot[]>()
    filteredSlots.forEach((slot) => {
      const floorId = typeof slot.floorId === 'string' ? slot.floorId : slot.floorId?._id
      if (!floorId) return
      const list = map.get(floorId) ?? []
      list.push(slot)
      map.set(floorId, list)
    })

    map.forEach((list) => list.sort(compareSlotCodes))
    return map
  }, [filteredSlots])

  const visibleFloors = useMemo(() => {
    return floors
      .filter((floor) => {
        const floorBuildingId = typeof floor.buildingId === 'string' ? floor.buildingId : floor.buildingId?._id
        if (buildingFilter !== 'all' && floorBuildingId !== buildingFilter) return false
        if (floorFilter !== 'all' && floor._id !== floorFilter) return false
        return slotsByFloor.has(floor._id)
      })
      .sort((a, b) => (a.floorNumber ?? 0) - (b.floorNumber ?? 0))
  }, [floors, buildingFilter, floorFilter, slotsByFloor])

  function handleOpenCreate() {
    setModalMode('create')
    setActiveSlot(null)
    setSubmitError(null)
    setModalOpen(true)
  }

  function handleOpenEdit(slot: ParkingSlot) {
    setModalMode('edit')
    setActiveSlot(slot)
    setSubmitError(null)
    setModalOpen(true)
  }

  async function reloadSlots() {
    const response = await parkingSlotApi.getSlots({ limit: 200, sortBy: 'slotCode', sortOrder: 'asc' })
    setSlots(response.slots ?? [])
  }

  async function handleSubmit(payload: SlotUpdatePayload | SlotBulkCreatePayload | { floorId: string; slotCode: string; vehicleType: 'car'; note?: string }) {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (modalMode === 'create') {
        if ('quantity' in payload) {
          await parkingSlotApi.bulkCreateSlots(payload)
        } else if ('floorId' in payload) {
          await parkingSlotApi.createSlot(payload)
        }
      } else if (activeSlot) {
        await parkingSlotApi.updateSlot(activeSlot._id, payload as SlotUpdatePayload)
      }
      await reloadSlots()
      setModalOpen(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save parking slot.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(slot: ParkingSlot) {
    if (!window.confirm(`Delete slot ${slot.slotCode}?`)) return

    try {
      await parkingSlotApi.deleteSlot(slot._id)
      await reloadSlots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete slot.')
    }
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Manager // Slots"
        title="Slots & Zones"
        description="Manage parking slots, status, and assignment details."
        actions={
          <div className="flex flex-col gap-3 sm:items-end">
            <button
              type="button"
              className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg"
              onClick={handleOpenCreate}
            >
              Create slot
            </button>
            <div className="grid grid-cols-3 gap-2 sm:min-w-[24rem]">
              <ManagerStatCard label="Total" value={totalSlots} detail="All slots" />
              <ManagerStatCard label="Occupied" value={occupiedSlots} detail="Currently occupied" />
              <ManagerStatCard label="Maintenance" value={maintenanceSlots} detail="Unavailable" />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="grid gap-1 text-xs text-subtle">
                Building
                <select
                  className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
                  value={buildingFilter}
                  onChange={(event) => {
                    setBuildingFilter(event.target.value)
                    setFloorFilter('all')
                  }}
                >
                  <option value="all">All</option>
                  {buildings.map((building) => (
                    <option key={building._id} value={building._id}>
                      {building.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-xs text-subtle">
                Floor
                <select
                  className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
                  value={floorFilter}
                  onChange={(event) => setFloorFilter(event.target.value)}
                >
                  <option value="all">All</option>
                  {floors
                    .filter((floor) => {
                      if (buildingFilter === 'all') return true
                      const floorBuildingId = typeof floor.buildingId === 'string' ? floor.buildingId : floor.buildingId?._id
                      return floorBuildingId === buildingFilter
                    })
                    .map((floor) => (
                      <option key={floor._id} value={floor._id}>
                        Floor {floor.floorNumber}
                      </option>
                    ))}
                </select>
              </label>
            </div>
          </div>
        }
      />

      {error && (
        <div className="liquid-glass-card rounded-lg border border-theme bg-badge p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {!error && isLoading && (
        <div className="liquid-glass-card rounded-lg border border-theme bg-badge p-4 text-sm text-muted">
          Loading parking slots...
        </div>
      )}

      {!error && !isLoading && filteredSlots.length === 0 && (
        <div className="liquid-glass-card rounded-lg border border-theme bg-badge p-4 text-sm text-muted">
          No parking slots match the current filters.
        </div>
      )}

      {!error && !isLoading && filteredSlots.length > 0 && (
        <section className="grid gap-5">
          {visibleFloors.map((floor) => {
            const floorBuildingId = typeof floor.buildingId === 'string' ? floor.buildingId : floor.buildingId?._id
            const building = floorBuildingId ? buildingMap.get(floorBuildingId) : undefined
            const groupedSlots = slotsByFloor.get(floor._id) ?? []

            return (
              <ManagerSlotGridSection
                key={floor._id}
                buildingName={building?.name}
                floorNumber={floor.floorNumber}
                slots={groupedSlots}
                onEdit={handleOpenEdit}
                onDelete={handleDelete}
              />
            )
          })}
        </section>
      )}

      <ManagerSlotFormModal
        open={modalOpen}
        mode={modalMode}
        floors={floors.filter((floor) => floor.vehicleType === 'car')}
        initialValues={
          activeSlot
            ? {
                floorId: typeof activeSlot.floorId === 'string' ? activeSlot.floorId : activeSlot.floorId?._id,
                slotCode: activeSlot.slotCode,
                vehicleType: activeSlot.vehicleType,
                status: activeSlot.status,
                note: activeSlot.note,
              }
            : undefined
        }
        isSubmitting={isSubmitting}
        error={submitError}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />
    </div>
  )
}

