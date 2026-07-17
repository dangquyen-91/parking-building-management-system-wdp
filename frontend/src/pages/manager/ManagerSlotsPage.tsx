import { Button } from '@/components/ui/button'
import { useState } from 'react'
import {
  ManagerParkingSpaceHeader,
  ManagerParkingSpaceList,
  ManagerRowFormModal,
  ManagerSlotFormModal,
  ManagerStatCard,
} from '../../components/manager'
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
    floorNumberFilter,
    sectionFilter,
    setBuildingFilter,
    setFloorNumberFilter,
    setSectionFilter,
    filteredSlots,
    filteredRows,
    slotsByFloor,
    rowsByFloor,
    visibleSlotFloors,
    visibleRowFloors,
    floorNumberOptions,
    sectionOptions,
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
  const [slotPendingDelete, setSlotPendingDelete] = useState<ParkingSlot | null>(null)
  const [isDeletingSlot, setIsDeletingSlot] = useState(false)

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
    setSlotPendingDelete(slot)
  }

  async function handleConfirmDeleteSlot() {
    if (!slotPendingDelete) return

    setIsDeletingSlot(true)
    try {
      await parkingSlotApi.deleteSlot(slotPendingDelete._id)
      await reloadSlots()
      setSlotPendingDelete(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể xóa ô đỗ.')
    } finally {
      setIsDeletingSlot(false)
    }
  }

  return (
    <div className="relative mx-auto max-w-[118rem] p-4 md:p-8 lg:p-10">
      <ManagerParkingSpaceHeader
        buildings={buildings}
        floorNumbers={floorNumberOptions}
        sections={sectionOptions}
        buildingFilter={buildingFilter}
        floorNumberFilter={floorNumberFilter}
        sectionFilter={sectionFilter}
        onBuildingFilterChange={setBuildingFilter}
        onFloorNumberFilterChange={setFloorNumberFilter}
        onSectionFilterChange={setSectionFilter}
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
        <div className="bg-card text-card-foreground ring-1 ring-border rounded-lg border border-border bg-card p-4 text-sm text-rose-100">
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

      {slotPendingDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-background shadow-2xl">
            <div className="border-b border-border bg-gradient-to-r from-rose-500/15 via-transparent to-transparent p-6">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-300">
                Xác nhận xóa
              </p>
              <h2 className="mt-2 text-2xl font-black text-foreground">Xóa ô đỗ {slotPendingDelete.slotCode}?</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Thao tác này sẽ xóa ô đỗ khỏi danh sách quản lý. Hãy chắc chắn ô không còn được sử dụng trước khi tiếp tục.
              </p>
            </div>
            <div className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-xl px-5 text-sm font-bold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => setSlotPendingDelete(null)}
                disabled={isDeletingSlot}
              >
                Hủy
              </Button>
              <Button
                type="button"
                className="h-11 rounded-xl bg-rose-600 px-5 text-sm font-bold text-white shadow-lg shadow-rose-600/20 transition-colors hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleConfirmDeleteSlot}
                disabled={isDeletingSlot}
              >
                {isDeletingSlot ? 'Đang xóa...' : 'Xóa ô đỗ'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



