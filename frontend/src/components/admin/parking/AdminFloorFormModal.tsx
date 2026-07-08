import { useEffect, useState, type FormEvent } from 'react'
import type { ManagerBuildingSummary } from '../../../hooks/useManagerBuildings'
import type { FloorPayload } from '../../../services/managerBuildingsApi'
import { AdminField, AdminModal, AdminModalActions } from '../common/AdminFormPrimitives'
import { Input } from '../../ui/input'
import { NativeSelect, NativeSelectOption } from '../../ui/native-select'
import { Textarea } from '../../ui/textarea'

type AdminFloorFormModalProps = {
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

export function AdminFloorFormModal({
  open,
  mode,
  buildings,
  floorId,
  initialValues,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: AdminFloorFormModalProps) {
  const defaultBuilding = buildings[0]?.id ?? ''
  const [buildingId, setBuildingId] = useState(defaultBuilding)
  const [floorNumber, setFloorNumber] = useState('')
  const [section, setSection] = useState('A')
  const [vehicleType, setVehicleType] = useState<FloorPayload['vehicleType']>('motorcycle')
  const [floorType, setFloorType] = useState<FloorPayload['floorType']>('resident')
  const [totalSlots, setTotalSlots] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    if (!open) return
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setBuildingId(initialValues?.buildingId ?? defaultBuilding)
    setFloorNumber(initialValues ? String(initialValues.floorNumber) : '')
    setSection(initialValues?.section ?? 'A')
    setVehicleType(initialValues?.vehicleType ?? 'motorcycle')
    setFloorType(initialValues?.floorType ?? 'resident')
    setTotalSlots(initialValues ? String(initialValues.totalSlots) : '')
    setDescription(initialValues?.description ?? '')
  }, [open, initialValues, defaultBuilding])

  if (!open) return null

  const valid = Boolean(buildingId && Number(floorNumber) > 0 && section.trim() && Number(totalSlots) > 0)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    onSubmit(
      {
        buildingId,
        floorNumber: Number(floorNumber),
        section: section.trim().toUpperCase(),
        vehicleType,
        floorType,
        totalSlots: Number(totalSlots),
        description: description.trim() || undefined,
      },
      floorId,
    )
  }

  return (
    <AdminModal title={mode === 'create' ? 'Tạo tầng' : 'Chỉnh sửa tầng'} eyebrow="Admin // Tầng" error={error} onClose={onClose}>
      <form className="grid gap-4" onSubmit={handleSubmit}>
        <AdminField label="Tòa nhà">
          <NativeSelect value={buildingId} disabled={mode === 'edit'} onChange={(event) => setBuildingId(event.target.value)}>
            {buildings.map((item) => (
              <NativeSelectOption key={item.id} value={item.id}>{item.name}</NativeSelectOption>
            ))}
          </NativeSelect>
        </AdminField>

        <div className="grid gap-3 sm:grid-cols-2">
          <AdminField label="Số tầng">
            <Input type="number" min="1" value={floorNumber} onChange={(event) => setFloorNumber(event.target.value)} />
          </AdminField>
          <AdminField label="Khu">
            <Input value={section} maxLength={10} placeholder="A" onChange={(event) => setSection(event.target.value.toUpperCase())} />
          </AdminField>
          <AdminField label="Tổng chỗ đỗ">
            <Input type="number" min="1" value={totalSlots} onChange={(event) => setTotalSlots(event.target.value)} />
          </AdminField>
          <AdminField label="Loại xe">
            <NativeSelect value={vehicleType} onChange={(event) => setVehicleType(event.target.value as FloorPayload['vehicleType'])}><NativeSelectOption value="motorcycle">Xe máy</NativeSelectOption><NativeSelectOption value="car">Ô tô</NativeSelectOption></NativeSelect>
          </AdminField>
          <AdminField label="Loại tầng">
            <NativeSelect value={floorType} onChange={(event) => setFloorType(event.target.value as FloorPayload['floorType'])}><NativeSelectOption value="resident">Cư dân</NativeSelectOption><NativeSelectOption value="visitor">Khách</NativeSelectOption></NativeSelect>
          </AdminField>
        </div>

        <AdminField label="Mô tả">
          <Textarea className="min-h-20" value={description} onChange={(event) => setDescription(event.target.value)} />
        </AdminField>
        <AdminModalActions disabled={!valid || isSubmitting} loading={isSubmitting} onClose={onClose} />
      </form>
    </AdminModal>
  )
}
