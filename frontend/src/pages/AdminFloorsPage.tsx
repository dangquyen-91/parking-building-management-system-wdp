import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge } from '../components/admin'
import { adminApi, type AdminBuildingDto, type AdminFloorDto } from '../services/adminApi'

type FloorFormState = {
  buildingId: string
  floorNumber: string
  vehicleType: AdminFloorDto['vehicleType']
  floorType: AdminFloorDto['floorType']
  totalSlots: string
  description: string
}

const emptyForm: FloorFormState = {
  buildingId: '',
  floorNumber: '',
  vehicleType: 'car',
  floorType: 'visitor',
  totalSlots: '',
  description: '',
}

function getBuilding(floor: AdminFloorDto) {
  return typeof floor.buildingId === 'string' ? undefined : floor.buildingId
}

function getBuildingId(floor: AdminFloorDto) {
  return typeof floor.buildingId === 'string' ? floor.buildingId : floor.buildingId._id
}

export function AdminFloorsPage() {
  const [floors, setFloors] = useState<AdminFloorDto[]>([])
  const [buildings, setBuildings] = useState<AdminBuildingDto[]>([])
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [form, setForm] = useState<FloorFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string>()
  const [error, setError] = useState<string>()

  async function loadFloors() {
    setIsLoading(true)
    setError(undefined)

    try {
      const [floorData, buildingData] = await Promise.all([
        adminApi.getFloors({ limit: 100, buildingId: buildingFilter === 'all' ? undefined : buildingFilter }),
        adminApi.getBuildings({ limit: 100, isActive: true }),
      ])
      setFloors(floorData.floors)
      setBuildings(buildingData.buildings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai tang')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadFloors()
  }, [buildingFilter])

  const totalSlots = floors.reduce((sum, floor) => sum + floor.totalSlots, 0)
  const activeFloors = floors.filter((floor) => floor.isActive).length
  const carFloors = floors.filter((floor) => floor.vehicleType === 'car').length

  function resetForm() {
    setEditingId(undefined)
    setForm(emptyForm)
  }

  function startEdit(floor: AdminFloorDto) {
    setEditingId(floor._id)
    setForm({
      buildingId: getBuildingId(floor),
      floorNumber: String(floor.floorNumber),
      vehicleType: floor.vehicleType,
      floorType: floor.floorType,
      totalSlots: String(floor.totalSlots),
      description: floor.description ?? '',
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingId(editingId ?? 'new')
    setError(undefined)

    const payload = {
      floorNumber: Number(form.floorNumber),
      vehicleType: form.vehicleType,
      floorType: form.floorType,
      totalSlots: Number(form.totalSlots),
      description: form.description.trim() || undefined,
    }

    try {
      if (editingId) {
        await adminApi.updateFloor(editingId, payload)
      } else {
        await adminApi.createFloor({ ...payload, buildingId: form.buildingId })
      }
      resetForm()
      await loadFloors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the luu tang')
    } finally {
      setSavingId(undefined)
    }
  }

  async function handleDeactivate(floor: AdminFloorDto) {
    setSavingId(floor._id)
    setError(undefined)

    try {
      await adminApi.deactivateFloor(floor._id)
      await loadFloors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the xoa tang')
    } finally {
      setSavingId(undefined)
    }
  }

  return (
    <AdminPageShell
      eyebrow="Admin // Floors"
      title="Floor Management"
      description="Tao, sua va vo hieu hoa tang theo toa nha, loai xe, loai tang va suc chua."
    >
      {error ? (
        <div className="mb-5 rounded-lg border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Floors" value={isLoading ? '...' : floors.length} detail={`${activeFloors} floors enabled`} />
        <AdminStatCard label="Total slots" value={totalSlots} detail="Across all buildings" />
        <AdminStatCard label="Car floors" value={carFloors} detail={`${floors.length - carFloors} motorcycle floors`} />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Buildings</p>
              <h2 className="mt-1 text-base font-semibold text-fg">Floor Directory</h2>
            </div>
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
          </div>

          <div className="grid gap-3">
            {floors.map((floor) => {
              const building = getBuilding(floor)
              const occupied =
                floor.vehicleType === 'car'
                  ? floor.slotStats?.occupied ?? 0
                  : floor.rowStats?.totalOccupied ?? 0
              const percent = floor.totalSlots > 0 ? Math.round((occupied / floor.totalSlots) * 100) : 0

              return (
                <article key={floor._id} className="rounded-lg border border-theme bg-badge p-4">
                  <div className="grid gap-4 lg:grid-cols-[1fr_7rem_7rem_8rem_9rem_10rem] lg:items-center">
                    <div>
                      <p className="text-base font-semibold text-fg">{building?.name ?? 'Unknown building'} / Floor {floor.floorNumber}</p>
                      <p className="mt-1 text-xs text-subtle">{floor.floorType} / {building?.address ?? floor._id}</p>
                    </div>
                    <div>
                      <p className="text-xs text-subtle">Vehicle</p>
                      <p className="mt-1 font-semibold text-fg">{floor.vehicleType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-subtle">Capacity</p>
                      <p className="mt-1 font-semibold text-fg">{floor.totalSlots}</p>
                    </div>
                    <div>
                      <p className="text-xs text-subtle">Occupied</p>
                      <p className="mt-1 font-semibold text-fg">{percent}%</p>
                    </div>
                    <AdminStatusBadge status={floor.isActive ? 'enabled' : 'maintenance'} label={floor.isActive ? 'enabled' : 'inactive'} />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="h-9 rounded-lg border border-theme-strong px-3 text-xs font-semibold text-fg transition-colors hover:bg-ghost"
                        onClick={() => startEdit(floor)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="h-9 rounded-lg border border-rose-400/40 px-3 text-xs font-semibold text-rose-100 transition-colors hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={savingId === floor._id || !floor.isActive}
                        onClick={() => handleDeactivate(floor)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-page">
                    <div className="h-full rounded-full bg-btn-primary" style={{ width: `${percent}%` }} />
                  </div>
                </article>
              )
            })}
            {!isLoading && floors.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Chua co tang nao theo bo loc hien tai.</p>
            ) : null}
          </div>
        </section>

        <aside className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">{editingId ? 'Update' : 'Create'}</p>
            <h2 className="mt-1 text-base font-semibold text-fg">{editingId ? 'Edit Floor' : 'New Floor'}</h2>
          </div>

          <form className="grid gap-3" onSubmit={handleSubmit}>
            <label className="grid gap-1 text-sm font-medium text-fg">
              Building
              <select
                className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                required
                value={form.buildingId}
                disabled={Boolean(editingId)}
                onChange={(event) => setForm((current) => ({ ...current, buildingId: event.target.value }))}
              >
                <option value="">Select building</option>
                {buildings.map((building) => (
                  <option key={building._id} value={building._id}>{building.name}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-1 text-sm font-medium text-fg">
              Floor number
              <input
                className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                min={1}
                required
                type="number"
                value={form.floorNumber}
                onChange={(event) => setForm((current) => ({ ...current, floorNumber: event.target.value }))}
              />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-medium text-fg">
                Vehicle
                <select
                  className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                  value={form.vehicleType}
                  onChange={(event) => setForm((current) => ({ ...current, vehicleType: event.target.value as AdminFloorDto['vehicleType'] }))}
                >
                  <option value="car">car</option>
                  <option value="motorcycle">motorcycle</option>
                </select>
              </label>
              <label className="grid gap-1 text-sm font-medium text-fg">
                Floor type
                <select
                  className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                  value={form.floorType}
                  onChange={(event) => setForm((current) => ({ ...current, floorType: event.target.value as AdminFloorDto['floorType'] }))}
                >
                  <option value="visitor">visitor</option>
                  <option value="resident">resident</option>
                </select>
              </label>
            </div>
            <label className="grid gap-1 text-sm font-medium text-fg">
              Total slots
              <input
                className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                min={1}
                required
                type="number"
                value={form.totalSlots}
                onChange={(event) => setForm((current) => ({ ...current, totalSlots: event.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-fg">
              Description
              <textarea
                className="auth-input min-h-20 rounded-lg border px-3 py-2 text-sm text-fg"
                maxLength={300}
                value={form.description}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              />
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="submit"
                className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={savingId === (editingId ?? 'new')}
              >
                {editingId ? 'Save changes' : 'Create floor'}
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
