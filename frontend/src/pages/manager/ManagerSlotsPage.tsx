import { useState } from 'react'
import { ManagerStatCard } from '../../components/manager'
import { ManagerParkingSpaceHeader } from '../../components/manager/ManagerParkingSpaceHeader'
import { ManagerParkingSpaceList } from '../../components/manager/ManagerParkingSpaceList'
import { ManagerRowFormModal } from '../../components/manager/ManagerRowFormModal'
import { ManagerSlotFormModal } from '../../components/manager/ManagerSlotFormModal'
import { useManagerParkingSpaces } from '../../hooks/useManagerParkingSpaces'
import { useParkingSpaceFilters } from '../../hooks/useParkingSpaceFilters'
import { parkingRowApi, type ParkingRow, type RowCreatePayload, type RowUpdatePayload } from '../../services/managerParkingRowApi'
import { parkingSlotApi, type ParkingSlot, type SlotBulkCreatePayload, type SlotUpdatePayload } from '../../services/managerParkingSlotApi'

export function ManagerSlotsPage() {
  const {
    slots,
    rows,
    floors,
    buildings,
    isLoading,
    error,
    setError,
    reloadSlots,
    reloadRows,
  } = useManagerParkingSpaces()
  const {
    buildingFilter,
    floorFilter,
    setBuildingFilter,
    setFloorFilter,
    filteredSlots,
    filteredRows,
    slotsByFloor,
    rowsByFloor,
    visibleSlotFloors,
    visibleRowFloors,
    filteredFloorOptions,
    buildingMap,
    stats,
  } = useParkingSpaceFilters({ slots, rows, floors, buildings })

  const [slotModalOpen, setSlotModalOpen] = useState(false)
  const [slotModalMode, setSlotModalMode] = useState<'create' | 'edit'>('create')
  const [rowModalOpen, setRowModalOpen] = useState(false)
  const [rowModalMode, setRowModalMode] = useState<'create' | 'edit'>('create')
  const [activeSlot, setActiveSlot] = useState<ParkingSlot | null>(null)
  const [activeRow, setActiveRow] = useState<ParkingRow | null>(null)
  const [slotSubmitError, setSlotSubmitError] = useState<string | null>(null)
  const [rowSubmitError, setRowSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleOpenCreateSlot() {
    setSlotModalMode('create')
    setActiveSlot(null)
    setSlotSubmitError(null)
    setSlotModalOpen(true)
  }

  function handleOpenEditSlot(slot: ParkingSlot) {
    setSlotModalMode('edit')
    setActiveSlot(slot)
    setSlotSubmitError(null)
    setSlotModalOpen(true)
  }

  function handleOpenCreateRow() {
    setRowModalMode('create')
    setActiveRow(null)
    setRowSubmitError(null)
    setRowModalOpen(true)
  }

  function handleOpenEditRow(row: ParkingRow) {
    setRowModalMode('edit')
    setActiveRow(row)
    setRowSubmitError(null)
    setRowModalOpen(true)
  }

  async function handleSlotSubmit(
    payload: SlotUpdatePayload | SlotBulkCreatePayload | { floorId: string; slotCode: string; vehicleType: 'car'; note?: string },
  ) {
    setIsSubmitting(true)
    setSlotSubmitError(null)

    try {
      if (slotModalMode === 'create') {
        if ('quantity' in payload) {
          await parkingSlotApi.bulkCreateSlots(payload)
        } else if ('floorId' in payload) {
          await parkingSlotApi.createSlot(payload)
        }
      } else if (activeSlot) {
        await parkingSlotApi.updateSlot(activeSlot._id, payload as SlotUpdatePayload)
      }
      await reloadSlots()
      setSlotModalOpen(false)
    } catch (err) {
      setSlotSubmitError(err instanceof Error ? err.message : 'Không thể lưu ô đỗ ô tô.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleRowSubmit(payload: RowCreatePayload | RowUpdatePayload) {
    setIsSubmitting(true)
    setRowSubmitError(null)

    try {
      if (rowModalMode === 'create') {
        await parkingRowApi.createRow(payload as RowCreatePayload)
      } else if (activeRow) {
        await parkingRowApi.updateRow(activeRow._id, payload as RowUpdatePayload)
      }
      await reloadRows()
      setRowModalOpen(false)
    } catch (err) {
      setRowSubmitError(err instanceof Error ? err.message : 'Không thể lưu hàng xe máy.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDeleteSlot(slot: ParkingSlot) {
    if (!window.confirm(`Xóa ô đỗ ${slot.slotCode}?`)) return

    try {
      await parkingSlotApi.deleteSlot(slot._id)
      await reloadSlots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa ô đỗ.')
    }
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <ManagerParkingSpaceHeader
        buildings={buildings}
        floors={filteredFloorOptions}
        buildingFilter={buildingFilter}
        floorFilter={floorFilter}
        onBuildingFilterChange={setBuildingFilter}
        onFloorFilterChange={setFloorFilter}
        onCreateSlot={handleOpenCreateSlot}
        onCreateRow={handleOpenCreateRow}
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-4">
        <ManagerStatCard label="Ô đỗ ô tô" value={stats.totalSlots} detail={`${stats.occupiedSlots} đang dùng`} />
        <ManagerStatCard label="Hàng xe máy" value={stats.totalRows} detail="Tổng số hàng" />
        <ManagerStatCard label="Sức chứa xe máy" value={stats.rowCapacity} detail={`${stats.rowOccupied} đang dùng`} />
        <ManagerStatCard label="Bảo trì" value={stats.maintenanceSlots} detail="Ô đỗ ô tô" />
      </div>

      {error && (
        <div className="liquid-glass-card rounded-lg border border-theme bg-badge p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      <ManagerParkingSpaceList
        isLoading={isLoading}
        hasError={Boolean(error)}
        filteredSlots={filteredSlots}
        filteredRows={filteredRows}
        visibleSlotFloors={visibleSlotFloors}
        visibleRowFloors={visibleRowFloors}
        slotsByFloor={slotsByFloor}
        rowsByFloor={rowsByFloor}
        buildingMap={buildingMap}
        onEditSlot={handleOpenEditSlot}
        onDeleteSlot={handleDeleteSlot}
        onEditRow={handleOpenEditRow}
      />

      <ManagerSlotFormModal
        open={slotModalOpen}
        mode={slotModalMode}
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
        error={slotSubmitError}
        onClose={() => setSlotModalOpen(false)}
        onSubmit={handleSlotSubmit}
      />

      <ManagerRowFormModal
        open={rowModalOpen}
        mode={rowModalMode}
        floors={floors.filter((floor) => floor.vehicleType === 'motorcycle')}
        initialValues={
          activeRow
            ? {
                floorId: typeof activeRow.floorId === 'string' ? activeRow.floorId : activeRow.floorId?._id,
                rowCode: activeRow.rowCode,
                capacity: activeRow.capacity,
                note: activeRow.note,
              }
            : undefined
        }
        isSubmitting={isSubmitting}
        error={rowSubmitError}
        onClose={() => setRowModalOpen(false)}
        onSubmit={handleRowSubmit}
      />
    </div>
  )
}
