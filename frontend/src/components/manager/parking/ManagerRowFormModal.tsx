import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { OverlayBackdrop } from '../../common'
import { useLockBodyScroll } from '../../../hooks/useLockBodyScroll'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { RowCreatePayload, RowUpdatePayload } from '../../../services/managerParkingRowApi'

type FloorOption = {
  id: string
  label: string
}

type ManagerRowFormModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  floors: Floor[]
  initialValues?: {
    floorId: string
    rowCode: string
    capacity: number
    note?: string | null
  }
  isSubmitting: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (payload: RowCreatePayload | RowUpdatePayload) => void
}

export function ManagerRowFormModal({
  open,
  mode,
  floors,
  initialValues,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ManagerRowFormModalProps) {
  const floorOptions = useMemo<FloorOption[]>(() => {
    return floors.map((floor) => {
      const buildingName = typeof floor.buildingId === 'string' ? '' : floor.buildingId?.name
      const label = buildingName
        ? `${buildingName} / Tầng ${floor.floorNumber}`
        : `Tầng ${floor.floorNumber}`

      return {
        id: floor._id,
        label,
      }
    })
  }, [floors])

  const defaultFloorId = useMemo(() => floorOptions[0]?.id ?? '', [floorOptions])
  const [floorId, setFloorId] = useState(defaultFloorId)
  const [rowCode, setRowCode] = useState('')
  const [capacity, setCapacity] = useState('')
  const [note, setNote] = useState('')

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return

    if (mode === 'edit' && initialValues) {
      setFloorId(initialValues.floorId)
      setRowCode(initialValues.rowCode)
      setCapacity(String(initialValues.capacity))
      setNote(initialValues.note ?? '')
      return
    }

    setFloorId(defaultFloorId)
    setRowCode('')
    setCapacity('')
    setNote('')
  }, [open, mode, initialValues, defaultFloorId])

  if (!open) return null

  const capacityValue = Number(capacity)
  const isValid =
    floorId.length > 0 &&
    rowCode.trim().length > 0 &&
    Number.isInteger(capacityValue) &&
    capacityValue > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValid || isSubmitting) return

    const payload = {
      rowCode: rowCode.trim(),
      capacity: capacityValue,
      note: note.trim() || null,
    }

    if (mode === 'create') {
      onSubmit({ floorId, ...payload })
      return
    }

    onSubmit(payload)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <OverlayBackdrop
        onClose={onClose}
        label="Đóng form hàng xe máy"
        className="fixed inset-0 z-40 bg-overlay/80 backdrop-blur-[2px]"
      />
      <div className="relative z-50 w-full max-w-xl rounded-2xl border border-border bg-background p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Quản lý // Hàng xe máy</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              {mode === 'create' ? 'Tạo hàng xe máy' : 'Chỉnh sửa hàng xe máy'}
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">Quản lý mã hàng, sức chứa và ghi chú.</p>
          </div>
          <Button type="button" className="text-xs text-muted-foreground hover:text-foreground" onClick={onClose}>
            Đóng
          </Button>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <Label className="grid gap-2 text-xs text-muted-foreground">
            Tầng xe máy
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

          <div className="grid gap-3 sm:grid-cols-2">
            <Label className="grid gap-2 text-xs text-muted-foreground">
              Mã hàng
              <Input
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                value={rowCode}
                onChange={(event) => setRowCode(event.target.value)}
                placeholder="R01"
                required
              />
            </Label>
            <Label className="grid gap-2 text-xs text-muted-foreground">
              Sức chứa
              <Input
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground"
                value={capacity}
                onChange={(event) => setCapacity(event.target.value)}
                placeholder="20"
                inputMode="numeric"
                required
              />
            </Label>
          </div>

          <Label className="grid gap-2 text-xs text-muted-foreground">
            Ghi chú (không bắt buộc)
            <Textarea
              className="min-h-[96px] rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Ví dụ: Hàng xe máy gần cổng"
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
              className="h-10 rounded-lg border border-border px-4 text-sm text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo hàng' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}




