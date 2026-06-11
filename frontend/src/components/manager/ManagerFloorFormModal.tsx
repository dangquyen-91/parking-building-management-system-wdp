import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { OverlayBackdrop } from '../common'
import { useLockBodyScroll } from '../../hooks/useLockBodyScroll'
import type { FloorPayload } from '../../services/managerBuildingsApi'
import type { ManagerBuildingSummary } from '../../hooks/useManagerBuildings'

type ManagerFloorFormModalProps = {
  open: boolean
  mode: 'create' | 'edit'
  buildings: ManagerBuildingSummary[]
  floorId?: string
  initialValues?: FloorPayload
  isSubmitting: boolean
  error?: string | null
  onClose: () => void
  onSubmit: (payload: FloorPayload, floorId?: string) => void
}

export function ManagerFloorFormModal({
  open,
  mode,
  buildings,
  floorId,
  initialValues,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: ManagerFloorFormModalProps) {
  const defaultBuildingId = useMemo(() => buildings[0]?.id ?? '', [buildings])
  const [buildingId, setBuildingId] = useState(defaultBuildingId)
  const [floorNumber, setFloorNumber] = useState('')
  const [vehicleType, setVehicleType] = useState<FloorPayload['vehicleType']>('motorcycle')
  const [floorType, setFloorType] = useState<FloorPayload['floorType']>('resident')
  const [totalSlots, setTotalSlots] = useState('')
  const [description, setDescription] = useState('')

  useLockBodyScroll(open)

  useEffect(() => {
    if (!open) return
    if (mode === 'edit' && initialValues) {
      setBuildingId(initialValues.buildingId)
      setFloorNumber(String(initialValues.floorNumber))
      setVehicleType(initialValues.vehicleType)
      setFloorType(initialValues.floorType)
      setTotalSlots(String(initialValues.totalSlots))
      setDescription(initialValues.description ?? '')
      return
    }

    setBuildingId(defaultBuildingId)
    setFloorNumber('')
    setVehicleType('motorcycle')
    setFloorType('resident')
    setTotalSlots('')
    setDescription('')
  }, [open, defaultBuildingId, initialValues, mode])

  if (!open) return null

  const floorNumberValue = Number(floorNumber)
  const totalSlotsValue = Number(totalSlots)
  const isValid =
    buildingId.length > 0 &&
    Number.isInteger(floorNumberValue) &&
    floorNumberValue >= 1 &&
    Number.isInteger(totalSlotsValue) &&
    totalSlotsValue > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValid || isSubmitting) return

    onSubmit({
      buildingId,
      floorNumber: floorNumberValue,
      vehicleType,
      floorType,
      totalSlots: totalSlotsValue,
      description: description.trim() || undefined,
    }, floorId)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-6">
      <OverlayBackdrop
        onClose={onClose}
        label="Đóng biểu mẫu tầng"
        className="fixed inset-0 z-40 bg-overlay/80 backdrop-blur-[2px]"
      />
      <div className="relative z-50 w-full max-w-xl rounded-2xl border border-theme bg-page p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-subtle">Quản lý // Tầng</p>
            <h2 className="mt-2 text-xl font-semibold text-fg">
              {mode === 'create' ? 'Tạo tầng' : 'Chỉnh sửa tầng'}
            </h2>
            <p className="mt-2 text-xs text-muted">Gán tầng vào tòa nhà và thiết lập sức chứa.</p>
          </div>
          <button
            type="button"
            className="text-xs text-subtle hover:text-fg"
            onClick={onClose}
          >
            Đóng
          </button>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <label className="grid gap-2 text-xs text-subtle">
            Tòa nhà
            <select
              className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-btn-primary/60"
              value={buildingId}
              onChange={(event) => setBuildingId(event.target.value)}
              required
              disabled={mode === 'edit'}
            >
              {buildings.map((building) => (
                <option key={building.id} value={building.id}>
                  {building.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-xs text-subtle">
            Số tầng
            <input
              className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-btn-primary/60"
              value={floorNumber}
              onChange={(event) => setFloorNumber(event.target.value)}
              placeholder="1"
              inputMode="numeric"
              required
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-xs text-subtle">
              Loại phương tiện
              <select
                className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-btn-primary/60"
                value={vehicleType}
                onChange={(event) => setVehicleType(event.target.value as FloorPayload['vehicleType'])}
              >
                <option value="motorcycle">Xe máy</option>
                <option value="car">Ô tô</option>
              </select>
            </label>

            <label className="grid gap-2 text-xs text-subtle">
              Loại tầng
              <select
                className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-btn-primary/60"
                value={floorType}
                onChange={(event) => setFloorType(event.target.value as FloorPayload['floorType'])}
              >
                <option value="resident">Cư dân</option>
                <option value="visitor">Khách</option>
              </select>
            </label>
          </div>

          <label className="grid gap-2 text-xs text-subtle">
            Tổng chỗ đỗ
            <input
              className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-btn-primary/60"
              value={totalSlots}
              onChange={(event) => setTotalSlots(event.target.value)}
              placeholder="50"
              inputMode="numeric"
              required
            />
          </label>

          <label className="grid gap-2 text-xs text-subtle">
            Mô tả (không bắt buộc)
            <textarea
              className="min-h-[96px] rounded-lg border border-theme bg-page px-3 py-2 text-sm text-fg focus:outline-none focus:ring-2 focus:ring-btn-primary/60"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tầng hầm dành cho xe máy"
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
              Hủy
            </button>
            <button
              type="submit"
              className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-opacity disabled:cursor-not-allowed disabled:opacity-60"
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo tầng' : 'Lưu thay đổi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
