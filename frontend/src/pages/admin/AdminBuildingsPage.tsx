import { useMemo, useState } from 'react'
import {
  AdminBuildingCard,
  AdminBuildingFormModal,
  AdminFloorFormModal,
  AdminPageShell,
  AdminStatCard,
} from '../../components/admin'
import { useManagerBuildings, type ManagerBuildingSummary } from '../../hooks/useManagerBuildings'
import { managerBuildingsApi, type BuildingPayload, type FloorPayload, type FloorUpdatePayload } from '../../services/managerBuildingsApi'

export function AdminBuildingsPage() {
  const { summaries, isLoading, error, reload } = useManagerBuildings()
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [buildingFilter, setBuildingFilter] = useState('all')
  const [buildingModal, setBuildingModal] = useState(false)
  const [buildingMode, setBuildingMode] = useState<'create' | 'edit'>('create')
  const [activeBuilding, setActiveBuilding] = useState<ManagerBuildingSummary | null>(null)
  const [floorModal, setFloorModal] = useState(false)
  const [floorMode, setFloorMode] = useState<'create' | 'edit'>('create')
  const [activeFloor, setActiveFloor] = useState<ManagerBuildingSummary['floors'][number] | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const filtered = useMemo(() => summaries.filter((item) => {
    if (statusFilter !== 'all' && item.isActive !== (statusFilter === 'active')) return false
    return buildingFilter === 'all' || item.id === buildingFilter
  }), [buildingFilter, statusFilter, summaries])
  const totals = filtered.reduce((sum, item) => ({ buildings: sum.buildings + 1, floors: sum.floors + item.floorCount, slots: sum.slots + item.totalSlots }), { buildings: 0, floors: 0, slots: 0 })

  async function saveBuilding(payload: BuildingPayload) {
    setSubmitting(true); setSubmitError(null)
    try {
      if (buildingMode === 'create') await managerBuildingsApi.createBuilding(payload)
      else if (activeBuilding) await managerBuildingsApi.updateBuilding(activeBuilding.id, payload)
      await reload(); setBuildingModal(false)
    } catch (err) { setSubmitError(err instanceof Error ? err.message : 'Không thể lưu tòa nhà.') }
    finally { setSubmitting(false) }
  }

  async function saveFloor(payload: FloorPayload, floorId?: string) {
    setSubmitting(true); setSubmitError(null)
    try {
      if (floorMode === 'create') await managerBuildingsApi.createFloor(payload)
      else if (floorId) {
        const updatePayload: FloorUpdatePayload = {
          floorNumber: payload.floorNumber,
          section: payload.section,
          vehicleType: payload.vehicleType,
          floorType: payload.floorType,
          totalSlots: payload.totalSlots,
          description: payload.description,
        }
        await managerBuildingsApi.updateFloor(floorId, updatePayload)
      }
      await reload(); setFloorModal(false)
    } catch (err) { setSubmitError(err instanceof Error ? err.message : 'Không thể lưu tầng.') }
    finally { setSubmitting(false) }
  }

  return (
    <AdminPageShell
      eyebrow="Admin // Tòa nhà"
      title="Tổng quan tòa nhà"
      description="Quản lý tòa nhà, danh sách tầng và tổng sức chứa trên toàn hệ thống."
      actions={<div className="grid w-full gap-3 rounded-2xl border border-theme bg-page/55 p-3 shadow-sm backdrop-blur-sm lg:min-w-[40rem]"><div className="flex flex-col gap-3 sm:flex-row sm:items-end"><div className="grid flex-1 gap-3 sm:grid-cols-2"><label className="grid gap-1 text-xs font-medium text-subtle">Trạng thái<select className="h-11 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/15" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}><option value="all">Tất cả</option><option value="active">Hoạt động</option><option value="inactive">Tạm dừng</option></select></label><label className="grid gap-1 text-xs font-medium text-subtle">Tòa nhà<select className="h-11 rounded-xl border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/15" value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)}><option value="all">Tất cả</option>{summaries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div><div className="flex gap-2"><button className="h-11 flex-1 rounded-xl bg-gradient-to-r from-sky-500 to-violet-500 px-4 text-sm font-black text-white shadow-lg shadow-sky-500/20 sm:flex-none" onClick={() => { setBuildingMode('create'); setActiveBuilding(null); setSubmitError(null); setBuildingModal(true) }}>+ Tòa nhà</button><button className="h-11 flex-1 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-4 text-sm font-bold text-emerald-700 transition hover:bg-emerald-500 hover:text-white dark:text-emerald-200 sm:flex-none" onClick={() => { setFloorMode('create'); setActiveFloor(null); setSubmitError(null); setFloorModal(true) }}>+ Tầng</button></div></div></div>}
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3"><AdminStatCard label="Tòa nhà" value={isLoading ? '-' : totals.buildings} detail="Theo bộ lọc hiện tại" tone="sky" /><AdminStatCard label="Tầng" value={isLoading ? '-' : totals.floors} detail="Tổng số tầng" tone="violet" /><AdminStatCard label="Chỗ đỗ" value={isLoading ? '-' : totals.slots} detail="Tổng sức chứa" tone="emerald" /></div>
      {error && <div className="mb-4 rounded-2xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-300">{error}</div>}
      {isLoading ? <div className="liquid-glass-card rounded-2xl border border-theme p-6 text-center text-sm text-muted">Đang tải dữ liệu tòa nhà...</div> : <section className="grid gap-4">{filtered.map((building) => <AdminBuildingCard key={building.id} building={building} onEdit={(item) => { setBuildingMode('edit'); setActiveBuilding(item); setSubmitError(null); setBuildingModal(true) }} onEditFloor={(floor) => { setFloorMode('edit'); setActiveFloor(floor); setSubmitError(null); setFloorModal(true) }} />)}{!filtered.length && <div className="liquid-glass-card rounded-2xl border border-dashed border-theme p-8 text-center text-sm text-muted">Không có tòa nhà phù hợp.</div>}</section>}
      <AdminBuildingFormModal open={buildingModal} mode={buildingMode} initialValues={activeBuilding ? { name: activeBuilding.name, address: activeBuilding.address, description: activeBuilding.description } : undefined} isSubmitting={submitting} error={submitError} onClose={() => setBuildingModal(false)} onSubmit={saveBuilding} />
      <AdminFloorFormModal open={floorModal} mode={floorMode} buildings={summaries} floorId={activeFloor?.id} initialValues={activeFloor ? { buildingId: activeFloor.buildingId, floorNumber: activeFloor.floorNumber, section: activeFloor.section, vehicleType: activeFloor.vehicleType, floorType: activeFloor.floorType, totalSlots: activeFloor.totalSlots, description: activeFloor.description } : undefined} isSubmitting={submitting} error={submitError} onClose={() => setFloorModal(false)} onSubmit={saveFloor} />
    </AdminPageShell>
  )
}
