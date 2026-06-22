import { useEffect, useState } from 'react'
import type { ManagerBuildingSummary } from '../../../hooks/useManagerBuildings'
import type { FloorPayload } from '../../../services/managerBuildingsApi'
import { AdminField, AdminModal, AdminModalActions, adminInputClass } from '../common/AdminFormPrimitives'

export function AdminFloorFormModal({ open, mode, buildings, floorId, initialValues, isSubmitting, error, onClose, onSubmit }: { open: boolean; mode: 'create' | 'edit'; buildings: ManagerBuildingSummary[]; floorId?: string; initialValues?: FloorPayload; isSubmitting: boolean; error?: string | null; onClose: () => void; onSubmit: (payload: FloorPayload, floorId?: string) => void }) {
  const defaultBuilding = buildings[0]?.id ?? ''
  const [buildingId, setBuildingId] = useState(defaultBuilding)
  const [floorNumber, setFloorNumber] = useState('')
  const [vehicleType, setVehicleType] = useState<FloorPayload['vehicleType']>('motorcycle')
  const [floorType, setFloorType] = useState<FloorPayload['floorType']>('resident')
  const [totalSlots, setTotalSlots] = useState('')
  const [description, setDescription] = useState('')

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (!open) return; setBuildingId(initialValues?.buildingId ?? defaultBuilding); setFloorNumber(initialValues ? String(initialValues.floorNumber) : ''); setVehicleType(initialValues?.vehicleType ?? 'motorcycle'); setFloorType(initialValues?.floorType ?? 'resident'); setTotalSlots(initialValues ? String(initialValues.totalSlots) : ''); setDescription(initialValues?.description ?? '') }, [open, initialValues, defaultBuilding])
  if (!open) return null

  const valid = buildingId && Number(floorNumber) > 0 && Number(totalSlots) > 0
  return (
    <AdminModal title={mode === 'create' ? 'Tạo tầng' : 'Chỉnh sửa tầng'} eyebrow="Admin // Tầng" error={error} onClose={onClose}>
      <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); onSubmit({ buildingId, floorNumber: Number(floorNumber), vehicleType, floorType, totalSlots: Number(totalSlots), description: description.trim() || undefined }, floorId) }}>
        <AdminField label="Tòa nhà"><select className={adminInputClass} value={buildingId} disabled={mode === 'edit'} onChange={(event) => setBuildingId(event.target.value)}>{buildings.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></AdminField>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="Số tầng"><input className={adminInputClass} type="number" min="1" value={floorNumber} onChange={(event) => setFloorNumber(event.target.value)} /></AdminField>
          <AdminField label="Tổng chỗ đỗ"><input className={adminInputClass} type="number" min="1" value={totalSlots} onChange={(event) => setTotalSlots(event.target.value)} /></AdminField>
          <AdminField label="Loại xe"><select className={adminInputClass} value={vehicleType} onChange={(event) => setVehicleType(event.target.value as FloorPayload['vehicleType'])}><option value="motorcycle">Xe máy</option><option value="car">Ô tô</option></select></AdminField>
          <AdminField label="Loại tầng"><select className={adminInputClass} value={floorType} onChange={(event) => setFloorType(event.target.value as FloorPayload['floorType'])}><option value="resident">Cư dân</option><option value="visitor">Khách</option></select></AdminField>
        </div>
        <AdminField label="Mô tả"><textarea className="min-h-20 rounded-xl border border-theme bg-page p-3 text-sm text-fg outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15" value={description} onChange={(event) => setDescription(event.target.value)} /></AdminField>
        <AdminModalActions disabled={!valid || isSubmitting} loading={isSubmitting} onClose={onClose} />
      </form>
    </AdminModal>
  )
}
