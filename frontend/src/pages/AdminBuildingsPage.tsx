import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge } from '../components/admin'
import { adminApi, type AdminBuildingDto } from '../services/adminApi'

type BuildingFormState = {
  name: string
  address: string
  description: string
}

const emptyForm: BuildingFormState = {
  name: '',
  address: '',
  description: '',
}

export function AdminBuildingsPage() {
  const [buildings, setBuildings] = useState<AdminBuildingDto[]>([])
  const [form, setForm] = useState<BuildingFormState>(emptyForm)
  const [editingId, setEditingId] = useState<string>()
  const [statusFilter, setStatusFilter] = useState<'all' | 'true' | 'false'>('all')
  const [search, setSearch] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [savingId, setSavingId] = useState<string>()
  const [error, setError] = useState<string>()

  async function loadBuildings() {
    setIsLoading(true)
    setError(undefined)

    try {
      const data = await adminApi.getBuildings({
        limit: 100,
        isActive: statusFilter === 'all' ? undefined : statusFilter,
      })
      setBuildings(data.buildings)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the tai danh sach toa nha')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadBuildings()
  }, [statusFilter])

  const visibleBuildings = useMemo(() => {
    const keyword = search.trim().toLowerCase()
    if (!keyword) return buildings

    return buildings.filter((building) =>
      [building.name, building.address, building.description].some((value) =>
        value?.toLowerCase().includes(keyword),
      ),
    )
  }, [buildings, search])

  const activeCount = buildings.filter((building) => building.isActive).length
  const inactiveCount = buildings.length - activeCount

  function startEdit(building: AdminBuildingDto) {
    setEditingId(building._id)
    setForm({
      name: building.name,
      address: building.address,
      description: building.description ?? '',
    })
  }

  function resetForm() {
    setEditingId(undefined)
    setForm(emptyForm)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSavingId(editingId ?? 'new')
    setError(undefined)

    const payload = {
      name: form.name.trim(),
      address: form.address.trim(),
      description: form.description.trim() || undefined,
    }

    try {
      if (editingId) {
        await adminApi.updateBuilding(editingId, payload)
      } else {
        await adminApi.createBuilding(payload)
      }
      resetForm()
      await loadBuildings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the luu toa nha')
    } finally {
      setSavingId(undefined)
    }
  }

  async function handleDeactivate(building: AdminBuildingDto) {
    setSavingId(building._id)
    setError(undefined)

    try {
      await adminApi.deactivateBuilding(building._id)
      await loadBuildings()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Khong the vo hieu hoa toa nha')
    } finally {
      setSavingId(undefined)
    }
  }

  return (
    <AdminPageShell
      eyebrow="Admin // Buildings"
      title="Building Management"
      description="Quan ly toa nha trong he thong, dia chi, mo ta va trang thai van hanh truoc khi cau hinh tang va slot."
    >
      {error ? (
        <div className="mb-5 rounded-lg border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Buildings" value={isLoading ? '...' : buildings.length} detail="Loaded from /buildings" />
        <AdminStatCard label="Active" value={activeCount} detail="Available for floors and slots" />
        <AdminStatCard label="Inactive" value={inactiveCount} detail="Deactivated by admin" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(0,1fr)_24rem]">
        <section className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Buildings</p>
              <h2 className="mt-1 text-base font-semibold text-fg">Building Directory</h2>
            </div>
            <div className="flex flex-wrap gap-2">
              <select
                className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | 'true' | 'false')}
              >
                <option value="all">All statuses</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
              <input
                className="auth-input h-10 w-full rounded-lg border px-3 text-sm text-fg md:w-48"
                placeholder="Search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-left text-sm">
              <thead className="border-b border-theme text-xs uppercase tracking-[0.14em] text-subtle">
                <tr>
                  <th className="px-3 py-3 font-medium">Building</th>
                  <th className="px-3 py-3 font-medium">Address</th>
                  <th className="px-3 py-3 font-medium">Description</th>
                  <th className="px-3 py-3 font-medium">Status</th>
                  <th className="px-3 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-theme">
                {visibleBuildings.map((building) => (
                  <tr key={building._id} className="align-top">
                    <td className="px-3 py-4">
                      <p className="font-semibold text-fg">{building.name}</p>
                      <p className="mt-1 text-xs text-subtle">{building._id}</p>
                    </td>
                    <td className="px-3 py-4 text-muted">{building.address}</td>
                    <td className="px-3 py-4 text-muted">{building.description || '-'}</td>
                    <td className="px-3 py-4">
                      <AdminStatusBadge status={building.isActive ? 'enabled' : 'maintenance'} label={building.isActive ? 'active' : 'inactive'} />
                    </td>
                    <td className="px-3 py-4">
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          className="h-9 rounded-lg border border-theme-strong px-3 text-xs font-semibold text-fg transition-colors hover:bg-ghost disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={savingId === building._id}
                          onClick={() => startEdit(building)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="h-9 rounded-lg border border-rose-400/40 px-3 text-xs font-semibold text-rose-100 transition-colors hover:bg-rose-500/10 disabled:cursor-not-allowed disabled:opacity-60"
                          disabled={savingId === building._id || !building.isActive}
                          onClick={() => handleDeactivate(building)}
                        >
                          Deactivate
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!isLoading && visibleBuildings.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted">Khong co toa nha phu hop bo loc.</p>
            ) : null}
          </div>
        </section>

        <aside className="liquid-glass-card rounded-lg p-4 md:p-5">
          <div className="mb-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">
              {editingId ? 'Update' : 'Create'}
            </p>
            <h2 className="mt-1 text-base font-semibold text-fg">
              {editingId ? 'Edit Building' : 'New Building'}
            </h2>
          </div>

          <form className="grid gap-3" onSubmit={handleSubmit}>
            <label className="grid gap-1 text-sm font-medium text-fg">
              Name
              <input
                className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                minLength={2}
                maxLength={100}
                required
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-fg">
              Address
              <input
                className="auth-input h-10 rounded-lg border px-3 text-sm text-fg"
                minLength={5}
                maxLength={200}
                required
                value={form.address}
                onChange={(event) => setForm((current) => ({ ...current, address: event.target.value }))}
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-fg">
              Description
              <textarea
                className="auth-input min-h-24 rounded-lg border px-3 py-2 text-sm text-fg"
                maxLength={500}
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
                {editingId ? 'Save changes' : 'Create building'}
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
