import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { OverlayBackdrop } from '../common'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import type { Floor } from '../../services/managerBuildingsApi'
import type { SlotBulkCreatePayload, SlotCreatePayload, SlotStatus, SlotUpdatePayload } from '../../services/managerParkingSlotApi'

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
        ? `${buildingName} / Floor ${floor.floorNumber}`
        : `Floor ${floor.floorNumber}`

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
        label="Close slot form"
        className="fixed inset-0 z-40 bg-overlay/80 backdrop-blur-[2px]"
      />
      <div className="relative z-50 w-full max-w-xl rounded-2xl border border-theme bg-page p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-subtle">Manager // Slots</p>
            <h2 className="mt-2 text-xl font-semibold text-fg">
              {mode === 'create' ? 'Create parking slot' : 'Edit parking slot'}
            </h2>
            <p className="mt-2 text-xs text-muted">Manage slot code, status, and notes.</p>
          </div>
          <button type="button" className="text-xs text-subtle hover:text-fg" onClick={onClose}>
            Close
          </button>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          {mode === 'create' && (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`h-9 rounded-full border px-4 text-xs font-semibold transition ${
                  createMode === 'single'
                    ? 'border-transparent bg-btn-primary text-btn-primary-fg'
                    : 'border-theme text-subtle hover:text-fg'
                }`}
                onClick={() => setCreateMode('single')}
              >
                Single slot
              </button>
              <button
                type="button"
                className={`h-9 rounded-full border px-4 text-xs font-semibold transition ${
                  createMode === 'bulk'
                    ? 'border-transparent bg-btn-primary text-btn-primary-fg'
                    : 'border-theme text-subtle hover:text-fg'
                }`}
                onClick={() => setCreateMode('bulk')}
              >
                Bulk create
              </button>
            </div>
          )}
          <label className="grid gap-2 text-xs text-subtle">
            Floor
            <select
              className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
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
            </select>
          </label>

          {mode === 'create' && createMode === 'bulk' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-xs text-subtle">
                Quantity
                <input
                  className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
                  value={quantity}
                  onChange={(event) => setQuantity(event.target.value)}
                  placeholder="20"
                  inputMode="numeric"
                  required
                />
              </label>
              <label className="grid gap-2 text-xs text-subtle">
                Start from
                <input
                  className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
                  value={startFrom}
                  onChange={(event) => setStartFrom(event.target.value)}
                  placeholder="1"
                  inputMode="numeric"
                  required
                />
              </label>
              <label className="grid gap-2 text-xs text-subtle sm:col-span-2">
                Prefix
                <input
                  className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
                  value={prefix}
                  onChange={(event) => setPrefix(event.target.value)}
                  placeholder="A"
                />
              </label>
            </div>
          ) : (
            <label className="grid gap-2 text-xs text-subtle">
              Slot code
              <input
                className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
                value={slotCode}
                onChange={(event) => setSlotCode(event.target.value)}
                placeholder="A01"
                required
              />
            </label>
          )}

          {mode === 'edit' && (
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-xs text-subtle">
                Vehicle type
                <select
                  className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
                  value={vehicleType}
                  onChange={(event) => setVehicleType(event.target.value as 'car' | 'motorcycle')}
                >
                  <option value="car">Car</option>
                  <option value="motorcycle">Motorcycle</option>
                </select>
              </label>

              <label className="grid gap-2 text-xs text-subtle">
                Status
                <select
                  className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as SlotStatus)}
                >
                  {SLOT_STATUSES.map((slotStatus) => (
                    <option key={slotStatus} value={slotStatus}>
                      {slotStatus}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          )}

          <label className="grid gap-2 text-xs text-subtle">
            Note (optional)
            <textarea
              className="min-h-[96px] rounded-lg border border-theme bg-page px-3 py-2 text-sm text-fg"
              value={note}
              onChange={(event) => setNote(event.target.value)}
              placeholder="Reserved for VIP"
            />
          </label>

          {error && (
            <div className="rounded-lg border border-theme bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              className="h-10 rounded-lg border border-theme px-4 text-sm text-subtle hover:text-fg"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting
                ? 'Saving...'
                : mode === 'create'
                ? createMode === 'bulk'
                  ? 'Create slots'
                  : 'Create slot'
                : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
