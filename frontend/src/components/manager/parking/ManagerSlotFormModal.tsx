import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { OverlayBackdrop } from '../../common'
import { useLockBodyScroll } from '../../../hooks/useLockBodyScroll'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { SlotBulkCreatePayload, SlotCreatePayload, SlotStatus, SlotUpdatePayload } from '../../../services/managerParkingSlotApi'

type FloorOption = {
  id: string
  label: string
  vehicleType?: string
}

type ManagerSlotFormModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  floors: Floor[]
  initialValues?: {
    floorId: string
    slotCode: string
    vehicleType: 'car' | 'motorcycle'
    status: SlotStatus
    note?: string
  }
  isSubmitting: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (payload: SlotCreatePayload | SlotUpdatePayload | SlotBulkCreatePayload) => void
}

const SLOT_STATUSES: SlotStatus[] = ['empty', 'occupied', 'reserved', 'maintenance']

const SLOT_STATUS_LABELS: Record<SlotStatus, string> = {
  empty: 'Trống',
  occupied: 'Đang dùng',
  reserved: 'Đã đặt',
  maintenance: 'Bảo trì',
}

export function ManagerSlotFormModal({
  open,
  mode,
  floors,
  initialValues,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ManagerSlotFormModalProps) {
  const floorOptions = useMemo<FloorOption[]>(() => {
    return floors.map((floor) => {
      const buildingName = typeof floor.buildingId === 'string' ? '' : floor.buildingId?.name
      const label = buildingName
        ? `${buildingName} / Tầng ${floor.floorNumber}`
        : `Tầng ${floor.floorNumber}`

      return {
        id: floor._id,
        label,
        vehicleType: floor.vehicleType,
      }
    })
  }, [floors])

  const defaultFloorId = useMemo(() => floorOptions[0]?.id ?? '', [floorOptions])
  const [floorId, setFloorId] = useState(defaultFloorId)
  const [slotCode, setSlotCode] = useState('')
  const [vehicleType, setVehicleType] = useState<'car' | 'motorcycle'>('car')
  const [status, setStatus] = useState<SlotStatus>('empty')
  const [note, setNote] = useState('')
  const [createMode, setCreateMode] = useState<'single' | 'bulk'>('single')
  const [quantity, setQuantity] = useState('')
  const [prefix, setPrefix] = useState('A')
  const [startFrom, setStartFrom] = useState('1')

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && initialValues) {
      setFloorId(initialValues.floorId)
      setSlotCode(initialValues.slotCode)
      setVehicleType(initialValues.vehicleType)
      setStatus(initialValues.status)
      setNote(initialValues.note ?? '')
      return
    }

    setFloorId(defaultFloorId)
    setSlotCode('')
    setVehicleType('car')
    setStatus('empty')
    setNote('')
    setCreateMode('single')
    setQuantity('')
    setPrefix('A')
    setStartFrom('1')
  }, [open, mode, initialValues, defaultFloorId])

  if (!open) return null

  const quantityValue = Number(quantity)
  const startFromValue = Number(startFrom)
  const isBulkValid =
    floorId.length > 0 &&
    Number.isInteger(quantityValue) &&
    quantityValue > 0 &&
    Number.isInteger(startFromValue) &&
    startFromValue > 0
  const isSingleValid = floorId.length > 0 && slotCode.trim().length > 0
  const isValid = mode === 'edit' ? isSingleValid : createMode === 'single' ? isSingleValid : isBulkValid

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValid || isSubmitting) return

    if (mode === 'create') {
      if (createMode === 'bulk') {
        onSubmit({
          floorId,
          quantity: quantityValue,
          prefix: prefix.trim() || undefined,
          startFrom: startFromValue,
        })
        return
      }

      onSubmit({
        floorId,
        slotCode: slotCode.trim(),
        vehicleType: 'car',
        note: note.trim() || undefined,
      })
      return
    }

    onSubmit({
      slotCode: slotCode.trim(),
      vehicleType,
      status,
      note: note.trim() || undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <OverlayBackdrop
        onClose={onClose}
        label="Đóng form ô đỗ"
        className="fixed inset-0 z-40 bg-overlay/80 backdrop-blur-[2px]"
      />
      <div className="relative z-50 w-full max-w-xl rounded-2xl border border-border bg-background p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Quản lý // Ô đỗ</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              {mode === 'create' ? 'Tạo ô đỗ ô tô' : 'Chỉnh sửa ô đỗ ô tô'}
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">Quản lý mã ô đỗ, trạng thái và ghi chú.</p>
          </div>
          <Button
            type="button"
            variant="outline"
            className="h-10 rounded-xl px-4 text-sm font-semibold text-foreground"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          {mode === 'create' && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                className={`h-9 rounded-full border px-4 text-xs font-semibold transition ${
                  createMode === 'single'
                    ? 'border-transparent bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setCreateMode('single')}
              >
                Một ô
              </Button>
              <Button
                type="button"
                className={`h-9 rounded-full border px-4 text-xs font-semibold transition ${
                  createMode === 'bulk'
                    ? 'border-transparent bg-primary text-primary-foreground'
                    : 'border-border text-muted-foreground hover:text-foreground'
                }`}
                onClick={() => setCreateMode('bulk')}
              >
                Tạo hàng loạt
              </Button>
            </div>
          )}
          <Label className="grid gap-2 text-xs text-muted-foreground">
            Tầng
            <NativeSelect
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
              value={floorId}
              onChange={(event) => setFloorId(event.target.value)}
              required
              disabled={mode === 'edit'}
            >
              {floorOptions.map((floor) => (
                <option key={floor.id} value={floor.id}>
                  {floor.label}
                </option>
              ))}
            </NativeSelect>
          </Label>

          {mode === 'create' && createMode === 'bulk' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Label className="grid gap-2 text-xs text-muted-foreground">
                Số lượng
                <Input
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="20"
                  inputMode="numeric"
                  required
                />
              </Label>
              <Label className="grid gap-2 text-xs text-muted-foreground">
                Bắt đầu từ
                <Input
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                  value={startFrom}
                  onChange={(event) => setStartFrom(event.target.value)}
                  placeholder="1"
                  inputMode="numeric"
                  required
                />
              </Label>
              <Label className="grid gap-2 text-xs text-muted-foreground sm:col-span-2">
                Tiền tố
                <Input
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                  value={prefix}
                  onChange={(event) => setPrefix(event.target.value)}
                  placeholder="A"
                />
              </Label>
            </div>
          ) : (
            <Label className="grid gap-2 text-xs text-muted-foreground">
              Mã ô đỗ
              <Input
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                value={slotCode}
                onChange={(event) => setSlotCode(event.target.value)}
                placeholder="A01"
                required
              />
            </Label>
          )}

          {mode === 'edit' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <Label className="grid gap-2 text-xs text-muted-foreground">
                Loại xe
                <NativeSelect
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                  value={vehicleType}
                  onChange={(event) => setVehicleType(event.target.value as 'car' | 'motorcycle')}
                >
                  <option value="car">Ô tô</option>
                  <option value="motorcycle">Xe máy</option>
                </NativeSelect>
              </Label>

              <Label className="grid gap-2 text-xs text-muted-foreground">
                Trạng thái
                <NativeSelect
                  className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as SlotStatus)}
                >
                  {SLOT_STATUSES.map((slotStatus) => (
                    <option key={slotStatus} value={slotStatus}>
                      {SLOT_STATUS_LABELS[slotStatus]}
                    </option>
                  ))}
                </NativeSelect>
              </Label>
            </div>
          )}

          <Label className="grid gap-2 text-xs text-muted-foreground">
            Ghi chú (không bắt buộc)
            <Textarea
              className="min-h-[96px] rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ví dụ: Dành riêng cho khách VIP"
            />
          </Label>

          {error && (
            <div className="rounded-lg border border-border bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-lg px-5 text-sm font-semibold text-foreground"
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting
                ? 'Đang lưu...'
                : mode === 'create'
                ? createMode === 'bulk'
                  ? 'Tạo các ô đỗ'
                  : 'Tạo ô đỗ'
                : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}




