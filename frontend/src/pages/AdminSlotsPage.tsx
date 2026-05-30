import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge } from '../components/admin'
import { adminApi, type AdminBuildingDto, type AdminFloorDto, type AdminSlotDto } from '../services/adminApi'

type SlotFormState = {
  floorId: string
  slotCode: string
  note: string
  status: AdminSlotDto['status']
  bulkQuantity: string
  bulkPrefix: string
  bulkStartFrom: string
}

const emptyForm: SlotFormState = {
  floorId: '',
  slotCode: '',
  note: '',
  status: 'empty',
  bulkQuantity: '',
  bulkPrefix: 'A',
  bulkStartFrom: '',
}

function getFloor(slot: AdminSlotDto) {
  return typeof slot.floorId === 'string' ? undefined : slot.floorId
}

function getFloorId(slot: AdminSlotDto) {
  return typeof slot.floorId === 'string' ? slot.floorId : slot.floorId._id
}

function getBuilding(floor?: AdminFloorDto) {
  return floor && typeof floor.buildingId !== 'string' ? floor.buildingId : undefined
}

const editableSlotStatuses: AdminSlotDto['status'][] = ['empty', 'reserved', 'maintenance']

export function AdminSlotsPage() {
  const [slots, setSlots] = useState<AdminSlotDto[]>([])
  const [buildings, setBuildings] = useState<AdminBuildingDto[]>([])
  const [floors, setFloors] = useState<AdminFloorDto[]>([])
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<AdminSlotDto['status'] | 'all'>('all')
  const [form, setForm] = useState<SlotFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string>()
  const [error, setError] = useState<string>()

  async function loadSlots() {
    setIsLoading(true)
    setError(undefined)

    try {
      const [slotData, buildingData, floorData] = await Promise.all([
        adminApi.getSlots({
          limit: 200,
          buildingId: buildingFilter === 'all' ? undefined : buildingFilter,
          status: statusFilter === 'all' ? undefined : statusFilter,
        }),
        adminApi.getBuildings({ limit: 100, isActive: true }),
        adminApi.getFloors({ limit: 100, vehicleType: 'car', isActive: true }),
      ])
      setSlots(slotData.slots)
      setBuildings(buildingData.buildings)
      setFloors(floorData.floors)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai danh sach slot')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadSlots()
  }, [buildingFilter, statusFilter])

  const stats = useMemo(() => {
    return {
      available: slots.filter((slot) => slot.status === 'empty').length,
      reserved: slots.filter((slot) => slot.status === 'reserved').length,
      maintenance: slots.filter((slot) => slot.status === 'maintenance').length,
      occupied: slots.filter((slot) => slot.status === 'occupied').length,
    }
  }, [slots])

  const selectableFloors = useMemo(() => {
    if (buildingFilter === 'all') return floors
    return floors.filter((floor) => {
      const building = getBuilding(floor)
      return building?._id === buildingFilter
    })
  }, [buildingFilter, floors])

  function resetForm() {
    setEditingId(undefined)
    setForm(emptyForm)
  }

  function startEdit(slot: AdminSlotDto) {
    setEditingId(slot._id)
    setForm({
      floorId: getFloorId(slot),
      slotCode: slot.slotCode,
      note: slot.note ?? '',
      status: slot.status,
      bulkQuantity: '',
      bulkPrefix: 'A',
      bulkStartFrom: '',
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingId(editingId ?? 'new')
    setError(undefined)

    try {
      if (editingId) {
        await adminApi.updateSlot(editingId, {
          slotCode: form.slotCode.trim(),
          status: form.status,
          note: form.note.trim(),
        })
      } else if (form.bulkQuantity) {
        await adminApi.bulkCreateSlots({
          floorId: form.floorId,
          quantity: Number(form.bulkQuantity),
          prefix: form.bulkPrefix.trim() || 'A',
          startFrom: form.bulkStartFrom ? Number(form.bulkStartFrom) : undefined,
        })
      } else {
        await adminApi.createSlot({
          floorId: form.floorId,
          slotCode: form.slotCode.trim(),
          vehicleType: 'car',
          note: form.note.trim() || undefined,
        })
      }
      resetForm()
      await loadSlots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the luu slot')
    } finally {
      setSavingId(undefined)
    }
  }

  async function handleDelete(slot: AdminSlotDto) {
    setSavingId(slot._id)
    setError(undefined)

    try {
      await adminApi.deleteSlot(slot._id)
      await loadSlots()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the xoa slot')
    } finally {
      setSavingId(undefined)
    }
  }

  return (
    <AdminPageShell
      eyebrow="Admin // Slots"
      title="Slot Management"
      description="Tao, sua, xoa va doi trang thai slot xe hoi theo toa nha va tang. Tang xe may dung Parking Rows rieng."
    >
      {error ? (
        <div className="mb-5 rounded-lg border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-4">
        <AdminStatCard label="All slots" value={isLoading ? '...' : slots.length} detail="Visible to admin" />
        <AdminStatCard label="Available" value={stats.available} detail="Ready for parking" />
        <AdminStatCard label="Occupied" value={stats.occupied} detail="Cars currently inside" />
        <AdminStatCard label="Maintenance" value={stats.maintenance} detail="Blocked slots" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Inventory</p>
              <h2 className="mt-1 text-base font-semibold text-fg">All Parking Slots</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                value={buildingFilter}
                onChange={(event) => setBuildingFilter(event.target.value)}
              >
                <option value="all">All buildings</option>
                {buildings.map((building) => (
                  <option key={building._id} value={building._id}>{building.name}</option>
                ))}
              </select>
              <select
                className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as AdminSlotDto['status'] | 'all')}
              >
                <option value="all">All statuses</option>
                <option value="empty">empty</option>
                <option value="occupied">occupied</option>
                <option value="reserved">reserved</option>
                <option value="maintenance">maintenance</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[58rem] text-left text-sm">
              <thead className="border-b border-theme text-xs uppercase tracking-[0.14em] text-subtle">
                <tr>
                  <th className="px-3 py-3 font-medium">Slot</th>
                  <th className="px-3 py-3 font-medium">Location</th>
                  <th className="px-3 py-3 font-medium">Vehicle</th>
                  <th className="px-3 py-3 font-medium">Note</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {slots.map((slot) => {
                  const floor = getFloor(slot)
                  const building = getBuilding(floor)

                  return (
                    <tr key={slot._id} className="align-top">
                      <td className="px-3 py-4">
                        <p className="font-semibold text-fg">{slot.slotCode}</p>
                        <p className="mt-1 text-xs text-subtle">{slot._id}</p>
                      </td>
                      <td className="px-3 py-4 text-muted">{building?.name ?? 'Unknown'} / Floor {floor?.floorNumber ?? '-'}</td>
                      <td className="px-3 py-4 font-medium text-fg">{slot.vehicleType}</td>
                      <td className="px-3 py-4 text-muted">{slot.note || '-'}</td>
                      <td className="px-3 py-4">
                        <AdminStatusBadge status={slot.status} label={slot.status === 'empty' ? 'available' : slot.status} />
                      </td>
                      <td className="px-3 py-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            className="h-9 rounded-lg border border-theme-strong px-3 text-xs font-semibold text-fg transition-colors hover:bg-ghost"
                            onClick={() => startEdit(slot)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="h-9 rounded-lg border border-rose-400/40 px-3 text-xs font-semibold text-rose-100 transition-colors hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                            disabled={savingId === slot._id || slot.status === 'occupied'}
                            onClick={() => handleDelete(slot)}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {!isLoading && slots.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Khong co slot phu hop bo loc.</p>
            ) : null}
          </div>
        </section>

        <aside className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">{editingId ? 'Update' : 'Create'}</p>
            <h2 className="mt-1 text-base font-semibold text-fg">{editingId ? 'Edit Slot' : 'New Slot'}</h2>
          </div>

          <form className="grid gap-3" onSubmit={handleSubmit}>
            <label className="grid gap-1 text-sm font-medium text-fg">
              Car floor
              <select
                className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                required
                value={form.floorId}
                disabled={Boolean(editingId)}
                onChange={(event) => setForm((current) => ({ ...current, floorId: event.target.value }))}
              >
                <option value="">Select floor</option>
                {selectableFloors.map((floor) => {
                  const building = getBuilding(floor)
                  return (
                    <option key={floor._id} value={floor._id}>
                      {building?.name ?? 'Building'} / Floor {floor.floorNumber}
                    </option>
                  )
                })}
              </select>
            </label>

            <label className="grid gap-1 text-sm font-medium text-fg">
              Slot code
              <input
                className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                maxLength={20}
                required={!form.bulkQuantity}
                value={form.slotCode}
                onChange={(event) => setForm((current) => ({ ...current, slotCode: event.target.value }))}
              />
            </label>

            {editingId ? (
              <label className="grid gap-1 text-sm font-medium text-fg">
                Status
                <select
                  className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                  value={form.status}
                  onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as AdminSlotDto['status'] }))}
                >
                  {form.status === 'occupied' ? <option value="occupied">occupied</option> : null}
                  {editableSlotStatuses.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </label>
            ) : (
              <div className="rounded-lg border border-theme bg-page p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-subtle">Bulk create</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-3">
                  <input
                    className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                    min={1}
                    max={200}
                    placeholder="Qty"
                    type="number"
                    value={form.bulkQuantity}
                    onChange={(event) => setForm((current) => ({ ...current, bulkQuantity: event.target.value }))}
                  />
                  <input
                    className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                    maxLength={5}
                    placeholder="Prefix"
                    value={form.bulkPrefix}
                    onChange={(event) => setForm((current) => ({ ...current, bulkPrefix: event.target.value }))}
                  />
                  <input
                    className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                    min={1}
                    placeholder="Start"
                    type="number"
                    value={form.bulkStartFrom}
                    onChange={(event) => setForm((current) => ({ ...current, bulkStartFrom: event.target.value }))}
                  />
                </div>
              </div>
            )}

            <label className="grid gap-1 text-sm font-medium text-fg">
              Note
              <textarea
                className="auth-input min-h-20 rounded-lg border px-3 py-2 text-sm text-fg"
                maxLength={300}
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
              />
            </label>

            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="submit"
                className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={savingId === (editingId ?? 'new')}
              >
                {editingId ? 'Save changes' : form.bulkQuantity ? 'Create bulk' : 'Create slot'}
              </button>
              {editingId ? (
                <button
                  type="button"
                  className="h-10 rounded-lg border border-theme-strong px-4 text-sm font-semibold text-fg transition-colors hover:bg-ghost"
                  onClick={resetForm}
                >
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </aside>
      </div>
    </AdminPageShell>
  )
}
