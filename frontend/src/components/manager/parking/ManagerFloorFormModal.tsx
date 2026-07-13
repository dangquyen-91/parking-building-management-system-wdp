import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { NativeSelect } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { OverlayBackdrop } from '../../common'
import { useLockBodyScroll } from '../../../hooks/useLockBodyScroll'
import type { FloorPayload } from '../../../services/managerBuildingsApi'
import type { ManagerBuildingSummary } from '../../../hooks/useManagerBuildings'

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
  const [section, setSection] = useState('A')
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
      setSection(initialValues.section ?? 'A')
      setVehicleType(initialValues.vehicleType)
      setFloorType(initialValues.floorType)
      setTotalSlots(String(initialValues.totalSlots))
      setDescription(initialValues.description ?? '')
      return
    }

    setBuildingId(defaultBuildingId)
    setFloorNumber('')
    setSection('A')
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
    section.trim().length > 0 &&
    Number.isInteger(totalSlotsValue) &&
    totalSlotsValue > 0

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!isValid || isSubmitting) return

    onSubmit({
      buildingId,
      floorNumber: floorNumberValue,
      section: section.trim().toUpperCase(),
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
      <div className="relative z-50 w-full max-w-xl rounded-2xl border border-border bg-background p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Quản lý // Tầng</p>
            <h2 className="mt-2 text-xl font-semibold text-foreground">
              {mode === 'create' ? 'Tạo tầng' : 'Chỉnh sửa tầng'}
            </h2>
            <p className="mt-2 text-xs text-muted-foreground">Gán tầng vào tòa nhà và thiết lập sức chứa.</p>
          </div>
          <Button
            type="button"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            Đóng
          </Button>
        </div>

        <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
          <Label className="grid gap-2 text-xs text-muted-foreground">
            Tòa nhà
            <NativeSelect
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
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
            </NativeSelect>
          </Label>

          <Label className="grid gap-2 text-xs text-muted-foreground">
            Số tầng
            <Input
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              value={floorNumber}
              onChange={(event) => setFloorNumber(event.target.value)}
              placeholder="1"
              inputMode="numeric"
              required
            />
          </Label>

          <Label className="grid gap-2 text-xs text-muted-foreground">
            Khu
            <Input
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm uppercase text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              value={section}
              onChange={(event) => setSection(event.target.value.toUpperCase())}
              placeholder="A"
              maxLength={8}
              required
            />
          </Label>

          <div className="grid gap-3 sm:grid-cols-2">
            <Label className="grid gap-2 text-xs text-muted-foreground">
              Loại phương tiện
              <NativeSelect
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                value={vehicleType}
                onChange={(event) => setVehicleType(event.target.value as FloorPayload['vehicleType'])}
              >
                <option value="motorcycle">Xe máy</option>
                <option value="car">Ô tô</option>
              </NativeSelect>
            </Label>

            <Label className="grid gap-2 text-xs text-muted-foreground">
              Loại tầng
              <NativeSelect
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
                value={floorType}
                onChange={(event) => setFloorType(event.target.value as FloorPayload['floorType'])}
              >
                <option value="resident">Cư dân</option>
                <option value="visitor">Khách</option>
              </NativeSelect>
            </Label>
          </div>

          <Label className="grid gap-2 text-xs text-muted-foreground">
            Tổng chỗ đỗ
            <Input
              className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              value={totalSlots}
              onChange={(event) => setTotalSlots(event.target.value)}
              placeholder="50"
              inputMode="numeric"
              required
            />
          </Label>

          <Label className="grid gap-2 text-xs text-muted-foreground">
            Mô tả (không bắt buộc)
            <Textarea
              className="min-h-[96px] rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Tầng hầm dành cho xe máy"
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
              {isSubmitting ? 'Đang lưu...' : mode === 'create' ? 'Tạo tầng' : 'Lưu thay đổi'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}




