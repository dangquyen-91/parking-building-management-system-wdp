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
      actions={<div className="grid w-full gap-3 lg:min-w-[38rem]"><div className="flex flex-col gap-3 rounded-lg border border-theme bg-badge p-3 sm:flex-row sm:items-end"><div className="grid flex-1 gap-3 sm:grid-cols-2"><label className="grid gap-1 text-xs text-subtle">Trạng thái<select className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}><option value="all">Tất cả</option><option value="active">Hoạt động</option><option value="inactive">Tạm dừng</option></select></label><label className="grid gap-1 text-xs text-subtle">Tòa nhà<select className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg" value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)}><option value="all">Tất cả</option>{summaries.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div><div className="flex gap-2"><button className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg" onClick={() => { setBuildingMode('create'); setActiveBuilding(null); setSubmitError(null); setBuildingModal(true) }}>Tạo tòa nhà</button><button className="h-10 rounded-lg border border-theme px-4 text-sm font-semibold text-fg" onClick={() => { setFloorMode('create'); setActiveFloor(null); setSubmitError(null); setFloorModal(true) }}>Tạo tầng</button></div></div></div>}
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3"><AdminStatCard label="Tòa nhà" value={isLoading ? '-' : totals.buildings} detail="Theo bộ lọc hiện tại" /><AdminStatCard label="Tầng" value={isLoading ? '-' : totals.floors} detail="Tổng số tầng" /><AdminStatCard label="Chỗ đỗ" value={isLoading ? '-' : totals.slots} detail="Tổng sức chứa" /></div>
      {error && <div className="mb-4 rounded-lg bg-rose-500/10 p-4 text-sm text-rose-300">{error}</div>}
      {isLoading ? <div className="liquid-glass-card rounded-lg p-4 text-sm text-muted">Đang tải dữ liệu tòa nhà...</div> : <section className="grid gap-4">{filtered.map((building) => <AdminBuildingCard key={building.id} building={building} onEdit={(item) => { setBuildingMode('edit'); setActiveBuilding(item); setSubmitError(null); setBuildingModal(true) }} onEditFloor={(floor) => { setFloorMode('edit'); setActiveFloor(floor); setSubmitError(null); setFloorModal(true) }} />)}{!filtered.length && <div className="liquid-glass-card rounded-lg p-4 text-sm text-muted">Không có tòa nhà phù hợp.</div>}</section>}
      <AdminBuildingFormModal open={buildingModal} mode={buildingMode} initialValues={activeBuilding ? { name: activeBuilding.name, address: activeBuilding.address, description: activeBuilding.description } : undefined} isSubmitting={submitting} error={submitError} onClose={() => setBuildingModal(false)} onSubmit={saveBuilding} />
      <AdminFloorFormModal open={floorModal} mode={floorMode} buildings={summaries} floorId={activeFloor?.id} initialValues={activeFloor ? { buildingId: activeFloor.buildingId, floorNumber: activeFloor.floorNumber, vehicleType: activeFloor.vehicleType, floorType: activeFloor.floorType, totalSlots: activeFloor.totalSlots, description: activeFloor.description } : undefined} isSubmitting={submitting} error={submitError} onClose={() => setFloorModal(false)} onSubmit={saveFloor} />
    </AdminPageShell>
  )
}
