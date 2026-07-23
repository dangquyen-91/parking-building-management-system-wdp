import { useEffect, useState } from 'react'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { SlotBulkCreatePayload, SlotCreatePayload, SlotStatus, SlotUpdatePayload } from '../../../services/managerParkingSlotApi'
import { formatFloorLabel } from '../../../utils/floorLabel'
import { AdminField, AdminModal, AdminModalActions } from '../common/AdminFormPrimitives'
import { Input } from '../../ui/input'
import { NativeSelect, NativeSelectOption } from '../../ui/native-select'
import { Tabs, TabsList, TabsTrigger } from '../../ui/tabs'
import { Textarea } from '../../ui/textarea'

type AdminSlotFormModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  floors: Floor[]
  initialValues?: { floorId: string; slotCode: string; vehicleType: 'car' | 'motorcycle'; status: SlotStatus; note?: string }
  isSubmitting: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (payload: SlotCreatePayload | SlotUpdatePayload | SlotBulkCreatePayload) => void
}

export function AdminSlotFormModal({
  open,
  mode,
  floors,
  initialValues,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: AdminSlotFormModalProps) {
  const defaultFloor = floors[0]?._id ?? ''
  const [floorId, setFloorId] = useState(defaultFloor)
  const [createType, setCreateType] = useState<'single' | 'bulk'>('single')
  const [slotCode, setSlotCode] = useState('')
  const [quantity, setQuantity] = useState(10)
  const [prefix, setPrefix] = useState('SLOT-')
  const [startFrom, setStartFrom] = useState(1)
  const [status, setStatus] = useState<SlotStatus>('empty')
  const [note, setNote] = useState('')

  useEffect(() => {
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFloorId(initialValues?.floorId ?? defaultFloor)
      setCreateType('single')
      setSlotCode(initialValues?.slotCode ?? '')
      setQuantity(10)
      setPrefix('SLOT-')
      setStartFrom(1)
      setStatus(initialValues?.status ?? 'empty')
      setNote(initialValues?.note ?? '')
    }
  }, [open, initialValues, defaultFloor])

  if (!open) return null

  const isBulkCreate = mode === 'create' && createType === 'bulk'
  const canSubmit = mode === 'edit'
    ? Boolean(slotCode.trim())
    : isBulkCreate
      ? Boolean(floorId) && quantity > 0 && startFrom >= 0
      : Boolean(floorId && slotCode.trim())

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (mode === 'edit') {
      onSubmit({ slotCode: slotCode.trim(), vehicleType: 'car', status, note: note.trim() || undefined })
      return
    }

    if (isBulkCreate) {
      onSubmit({
        floorId,
        quantity,
        prefix: prefix.trim() || undefined,
        startFrom,
      })
      return
    }

    onSubmit({ floorId, slotCode: slotCode.trim(), vehicleType: 'car', note: note.trim() || undefined })
  }

  return (
    <AdminModal eyebrow="Admin // Ô đỗ" title={mode === 'create' ? 'Tạo ô đỗ ô tô' : 'Chỉnh sửa ô đỗ'} error={error} onClose={onClose}>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <AdminField label="Tầng / Khu">
          <NativeSelect value={floorId} disabled={mode === 'edit'} onChange={(event) => setFloorId(event.target.value)}>
            {floors.map((floor) => (
              <NativeSelectOption key={floor._id} value={floor._id}>
                {formatFloorLabel(floor)}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </AdminField>

        {mode === 'create' && (
          <Tabs value={createType} onValueChange={(value) => setCreateType(value as 'single' | 'bulk')}><TabsList className="grid w-full grid-cols-2"><TabsTrigger value="single">Tạo 1 ô</TabsTrigger><TabsTrigger value="bulk">Tạo nhiều ô</TabsTrigger></TabsList></Tabs>
        )}

        {isBulkCreate ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <AdminField label="Tiền tố mã ô">
              <Input value={prefix} onChange={(event) => setPrefix(event.target.value)} placeholder="VD: A-" />
            </AdminField>
            <AdminField label="Bắt đầu từ">
              <Input
                type="number"
                min={0}
                value={startFrom}
                onChange={(event) => setStartFrom(Number(event.target.value))}
              />
            </AdminField>
            <AdminField label="Số lượng">
              <Input
                type="number"
                min={1}
                value={quantity}
                onChange={(event) => setQuantity(Number(event.target.value))}
                required
              />
            </AdminField>
          </div>
        ) : (
          <AdminField label="Mã ô đỗ">
            <Input value={slotCode} onChange={(event) => setSlotCode(event.target.value)} required />
          </AdminField>
        )}

        {mode === 'edit' && (
          <AdminField label="Trạng thái">
            <NativeSelect value={status} onChange={(event) => setStatus(event.target.value as SlotStatus)}><NativeSelectOption value="empty">Trống</NativeSelectOption><NativeSelectOption value="occupied">Đang dùng</NativeSelectOption><NativeSelectOption value="reserved">Đã đặt</NativeSelectOption><NativeSelectOption value="maintenance">Bảo trì</NativeSelectOption></NativeSelect>
          </AdminField>
        )}

        {!isBulkCreate && (
          <AdminField label="Ghi chú">
            <Textarea className="min-h-20" value={note} onChange={(event) => setNote(event.target.value)} />
          </AdminField>
        )}

        <AdminModalActions disabled={!canSubmit || isSubmitting} loading={isSubmitting} onClose={onClose} />
      </form>
    </AdminModal>
  )
}

