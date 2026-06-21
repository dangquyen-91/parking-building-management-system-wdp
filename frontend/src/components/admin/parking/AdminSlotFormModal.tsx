import { useEffect, useState } from 'react'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { SlotBulkCreatePayload, SlotCreatePayload, SlotStatus, SlotUpdatePayload } from '../../../services/managerParkingSlotApi'
import { AdminField, AdminModal, AdminModalActions, adminInputClass } from '../common/AdminFormPrimitives'

export function AdminSlotFormModal({ open, mode, floors, initialValues, isSubmitting, error, onClose, onSubmit }: { open: boolean; mode: 'create' | 'edit'; floors: Floor[]; initialValues?: { floorId: string; slotCode: string; vehicleType: 'car' | 'motorcycle'; status: SlotStatus; note?: string }; isSubmitting: boolean; error?: string | null; onClose: () => void; onSubmit: (payload: SlotCreatePayload | SlotUpdatePayload | SlotBulkCreatePayload) => void }) {
  const defaultFloor = floors[0]?._id ?? ''
  const [floorId, setFloorId] = useState(defaultFloor)
  const [slotCode, setSlotCode] = useState('')
  const [status, setStatus] = useState<SlotStatus>('empty')
  const [note, setNote] = useState('')

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (open) { setFloorId(initialValues?.floorId ?? defaultFloor); setSlotCode(initialValues?.slotCode ?? ''); setStatus(initialValues?.status ?? 'empty'); setNote(initialValues?.note ?? '') } }, [open, initialValues, defaultFloor])
  if (!open) return null

  return (
    <AdminModal eyebrow="Admin // Ô đỗ" title={mode === 'create' ? 'Tạo ô đỗ ô tô' : 'Chỉnh sửa ô đỗ'} error={error} onClose={onClose}>
      <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); onSubmit(mode === 'create' ? { floorId, slotCode: slotCode.trim(), vehicleType: 'car', note: note.trim() || undefined } : { slotCode: slotCode.trim(), vehicleType: 'car', status, note: note.trim() || undefined }) }}>
        <AdminField label="Tầng"><select className={adminInputClass} value={floorId} disabled={mode === 'edit'} onChange={(event) => setFloorId(event.target.value)}>{floors.map((floor) => <option key={floor._id} value={floor._id}>Tầng {floor.floorNumber}</option>)}</select></AdminField>
        <AdminField label="Mã ô đỗ"><input className={adminInputClass} value={slotCode} onChange={(event) => setSlotCode(event.target.value)} required /></AdminField>
        {mode === 'edit' && <AdminField label="Trạng thái"><select className={adminInputClass} value={status} onChange={(event) => setStatus(event.target.value as SlotStatus)}><option value="empty">Trống</option><option value="occupied">Đang dùng</option><option value="reserved">Đã đặt</option><option value="maintenance">Bảo trì</option></select></AdminField>}
        <AdminField label="Ghi chú"><textarea className="min-h-20 rounded-lg border border-theme bg-page p-3 text-sm text-fg" value={note} onChange={(event) => setNote(event.target.value)} /></AdminField>
        <AdminModalActions disabled={!floorId || !slotCode.trim() || isSubmitting} loading={isSubmitting} onClose={onClose} />
      </form>
    </AdminModal>
  )
}
