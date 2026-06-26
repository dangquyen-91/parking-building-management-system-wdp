import { useEffect, useState } from 'react'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { RowCreatePayload, RowUpdatePayload } from '../../../services/managerParkingRowApi'
import { formatFloorLabel } from '../../../utils/floorLabel'
import { AdminField, AdminModal, AdminModalActions, adminInputClass } from '../common/AdminFormPrimitives'

type AdminRowFormModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  floors: Floor[]
  initialValues?: { floorId: string; rowCode: string; capacity: number; note?: string | null }
  isSubmitting: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (payload: RowCreatePayload | RowUpdatePayload) => void
}

export function AdminRowFormModal({
  open,
  mode,
  floors,
  initialValues,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: AdminRowFormModalProps) {
  const defaultFloor = floors[0]?._id ?? ''
  const [floorId, setFloorId] = useState(defaultFloor)
  const [rowCode, setRowCode] = useState('')
  const [capacity, setCapacity] = useState('')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) {
      setFloorId(initialValues?.floorId ?? defaultFloor)
      setRowCode(initialValues?.rowCode ?? '')
      setCapacity(initialValues ? String(initialValues.capacity) : '')
      setNote(initialValues?.note ?? '')
    }
  }, [open, initialValues, defaultFloor])

  if (!open) return null

  return (
    <AdminModal eyebrow="Admin // Hàng xe máy" title={mode === 'create' ? 'Tạo hàng xe máy' : 'Chỉnh sửa hàng xe máy'} error={error} onClose={onClose}>
      <form className="grid gap-4" onSubmit={(event) => { event.preventDefault(); const base = { rowCode: rowCode.trim(), capacity: Number(capacity), note: note.trim() || null }; onSubmit(mode === 'create' ? { floorId, ...base } : base) }}>
        <AdminField label="Tầng / Khu">
          <select className={adminInputClass} value={floorId} disabled={mode === 'edit'} onChange={(event) => setFloorId(event.target.value)}>
            {floors.map((floor) => (
              <option key={floor._id} value={floor._id}>{formatFloorLabel(floor)}</option>
            ))}
          </select>
        </AdminField>
        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="Mã hàng"><input className={adminInputClass} value={rowCode} onChange={(event) => setRowCode(event.target.value)} /></AdminField>
          <AdminField label="Sức chứa"><input className={adminInputClass} type="number" min="1" value={capacity} onChange={(event) => setCapacity(event.target.value)} /></AdminField>
        </div>
        <AdminField label="Ghi chú"><textarea className="min-h-20 rounded-lg border border-theme bg-page p-3 text-sm text-fg" value={note} onChange={(event) => setNote(event.target.value)} /></AdminField>
        <AdminModalActions disabled={!floorId || !rowCode.trim() || Number(capacity) < 1 || isSubmitting} loading={isSubmitting} onClose={onClose} />
      </form>
    </AdminModal>
  )
}
