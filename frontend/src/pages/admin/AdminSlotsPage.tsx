import { useState } from 'react'
import {
  AdminParkingSpaceHeader,
  AdminParkingSpaceList,
  AdminRowFormModal,
  AdminSlotFormModal,
  AdminStatCard,
} from '../../components/admin'
import { useManagerParkingSpaces } from '../../hooks/useManagerParkingSpaces'
import { useParkingSpaceFilters } from '../../hooks/useParkingSpaceFilters'
import { parkingRowApi, type ParkingRow, type RowCreatePayload, type RowUpdatePayload } from '../../services/managerParkingRowApi'
import { parkingSlotApi, type ParkingSlot, type SlotBulkCreatePayload, type SlotUpdatePayload } from '../../services/managerParkingSlotApi'

export function AdminSlotsPage() {
  const { slots, rows, floors, buildings, isLoading, error, setError, reloadSlots, reloadRows } = useManagerParkingSpaces()
  const filters = useParkingSpaceFilters({ slots, rows, floors, buildings })
  const [slotOpen, setSlotOpen] = useState(false); const [slotMode, setSlotMode] = useState<'create' | 'edit'>('create'); const [activeSlot, setActiveSlot] = useState<ParkingSlot | null>(null)
  const [rowOpen, setRowOpen] = useState(false); const [rowMode, setRowMode] = useState<'create' | 'edit'>('create'); const [activeRow, setActiveRow] = useState<ParkingRow | null>(null)
  const [submitting, setSubmitting] = useState(false); const [submitError, setSubmitError] = useState<string | null>(null)

  async function saveSlot(payload: SlotUpdatePayload | SlotBulkCreatePayload | { floorId: string; slotCode: string; vehicleType: 'car'; note?: string }) {
    setSubmitting(true); setSubmitError(null)
    try {
      if (slotMode === 'create') {
        if ('quantity' in payload) await parkingSlotApi.bulkCreateSlots(payload)
        else if ('floorId' in payload) await parkingSlotApi.createSlot(payload)
      } else if (activeSlot) await parkingSlotApi.updateSlot(activeSlot._id, payload as SlotUpdatePayload)
      await reloadSlots(); setSlotOpen(false)
    } catch (err) { setSubmitError(err instanceof Error ? err.message : 'Không thể lưu ô đỗ.') }
    finally { setSubmitting(false) }
  }
  async function saveRow(payload: RowCreatePayload | RowUpdatePayload) {
    setSubmitting(true); setSubmitError(null)
    try { if (rowMode === 'create') await parkingRowApi.createRow(payload as RowCreatePayload); else if (activeRow) await parkingRowApi.updateRow(activeRow._id, payload as RowUpdatePayload); await reloadRows(); setRowOpen(false) }
    catch (err) { setSubmitError(err instanceof Error ? err.message : 'Không thể lưu hàng xe máy.') }
    finally { setSubmitting(false) }
  }
  async function deleteSlot(slot: ParkingSlot) {
    if (!window.confirm(`Xóa ô đỗ ${slot.slotCode}?`)) return
    try { await parkingSlotApi.deleteSlot(slot._id); await reloadSlots() } catch (err) { setError(err instanceof Error ? err.message : 'Không thể xóa ô đỗ.') }
  }

  return <div className="pb-10">
    <AdminParkingSpaceHeader buildings={buildings} floors={filters.filteredFloorOptions} buildingFilter={filters.buildingFilter} floorFilter={filters.floorFilter} onBuildingFilterChange={filters.setBuildingFilter} onFloorFilterChange={filters.setFloorFilter} onCreateSlot={() => { setSlotMode('create'); setActiveSlot(null); setSubmitError(null); setSlotOpen(true) }} onCreateRow={() => { setRowMode('create'); setActiveRow(null); setSubmitError(null); setRowOpen(true) }} />
    <div className="px-4 md:px-8 lg:px-10"><div className="mb-6 grid gap-3 sm:grid-cols-4"><AdminStatCard label="Ô đỗ ô tô" value={filters.stats.totalSlots} detail={`${filters.stats.occupiedSlots} đang dùng`} /><AdminStatCard label="Hàng xe máy" value={filters.stats.totalRows} detail="Tổng số hàng" /><AdminStatCard label="Sức chứa xe máy" value={filters.stats.rowCapacity} detail={`${filters.stats.rowOccupied} đang dùng`} /><AdminStatCard label="Bảo trì" value={filters.stats.maintenanceSlots} detail="Ô đỗ ô tô" /></div>{error && <div className="mb-4 rounded-lg bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>}<AdminParkingSpaceList isLoading={isLoading} hasError={Boolean(error)} filteredSlots={filters.filteredSlots} filteredRows={filters.filteredRows} visibleSlotFloors={filters.visibleSlotFloors} visibleRowFloors={filters.visibleRowFloors} slotsByFloor={filters.slotsByFloor} rowsByFloor={filters.rowsByFloor} buildingMap={filters.buildingMap} onEditSlot={(slot) => { setSlotMode('edit'); setActiveSlot(slot); setSubmitError(null); setSlotOpen(true) }} onDeleteSlot={(slot) => void deleteSlot(slot)} onEditRow={(row) => { setRowMode('edit'); setActiveRow(row); setSubmitError(null); setRowOpen(true) }} /></div>
    <AdminSlotFormModal open={slotOpen} mode={slotMode} floors={floors.filter((floor) => floor.vehicleType === 'car')} initialValues={activeSlot ? { floorId: typeof activeSlot.floorId === 'string' ? activeSlot.floorId : activeSlot.floorId?._id, slotCode: activeSlot.slotCode, vehicleType: activeSlot.vehicleType, status: activeSlot.status, note: activeSlot.note } : undefined} isSubmitting={submitting} error={submitError} onClose={() => setSlotOpen(false)} onSubmit={saveSlot} />
    <AdminRowFormModal open={rowOpen} mode={rowMode} floors={floors.filter((floor) => floor.vehicleType === 'motorcycle')} initialValues={activeRow ? { floorId: typeof activeRow.floorId === 'string' ? activeRow.floorId : activeRow.floorId?._id, rowCode: activeRow.rowCode, capacity: activeRow.capacity, note: activeRow.note } : undefined} isSubmitting={submitting} error={submitError} onClose={() => setRowOpen(false)} onSubmit={saveRow} />
  </div>
}
