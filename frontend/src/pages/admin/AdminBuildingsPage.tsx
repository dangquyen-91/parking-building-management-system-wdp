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
import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Label } from '../../components/ui/label'
import { NativeSelect, NativeSelectOption } from '../../components/ui/native-select'
import { Skeleton } from '../../components/ui/skeleton'

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
      actions={<Card className="w-full lg:min-w-[40rem]"><CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-end"><div className="grid flex-1 gap-3 sm:grid-cols-2"><Label className="grid gap-2">Trạng thái<NativeSelect value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}><NativeSelectOption value="all">Tất cả</NativeSelectOption><NativeSelectOption value="active">Hoạt động</NativeSelectOption><NativeSelectOption value="inactive">Tạm dừng</NativeSelectOption></NativeSelect></Label><Label className="grid gap-2">Tòa nhà<NativeSelect value={buildingFilter} onChange={(e) => setBuildingFilter(e.target.value)}><NativeSelectOption value="all">Tất cả</NativeSelectOption>{summaries.map((item) => <NativeSelectOption key={item.id} value={item.id}>{item.name}</NativeSelectOption>)}</NativeSelect></Label></div><div className="flex gap-2"><Button onClick={() => { setBuildingMode('create'); setActiveBuilding(null); setSubmitError(null); setBuildingModal(true) }}><Plus />Tòa nhà</Button><Button variant="outline" onClick={() => { setFloorMode('create'); setActiveFloor(null); setSubmitError(null); setFloorModal(true) }}><Plus />Tầng</Button></div></CardContent></Card>}
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3"><AdminStatCard label="Tòa nhà" value={isLoading ? '-' : totals.buildings} detail="Theo bộ lọc hiện tại" tone="sky" /><AdminStatCard label="Tầng" value={isLoading ? '-' : totals.floors} detail="Tổng số tầng" tone="violet" /><AdminStatCard label="Chỗ đỗ" value={isLoading ? '-' : totals.slots} detail="Tổng sức chứa" tone="emerald" /></div>
      {error && <Card className="mb-4 border-destructive/40"><CardContent className="p-4 text-sm text-destructive">{error}</CardContent></Card>}
      {isLoading ? <div className="grid gap-4">{Array.from({ length: 3 }, (_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}</div> : <section className="grid gap-4">{filtered.map((building) => <AdminBuildingCard key={building.id} building={building} onEdit={(item) => { setBuildingMode('edit'); setActiveBuilding(item); setSubmitError(null); setBuildingModal(true) }} onEditFloor={(floor) => { setFloorMode('edit'); setActiveFloor(floor); setSubmitError(null); setFloorModal(true) }} />)}{!filtered.length && <Card className="border-dashed"><CardContent className="p-8 text-center text-sm text-muted-foreground">Không có tòa nhà phù hợp.</CardContent></Card>}</section>}
      <AdminBuildingFormModal open={buildingModal} mode={buildingMode} initialValues={activeBuilding ? { name: activeBuilding.name, address: activeBuilding.address, description: activeBuilding.description } : undefined} isSubmitting={submitting} error={submitError} onClose={() => setBuildingModal(false)} onSubmit={saveBuilding} />
      <AdminFloorFormModal open={floorModal} mode={floorMode} buildings={summaries} floorId={activeFloor?.id} initialValues={activeFloor ? { buildingId: activeFloor.buildingId, floorNumber: activeFloor.floorNumber, section: activeFloor.section, vehicleType: activeFloor.vehicleType, floorType: activeFloor.floorType, totalSlots: activeFloor.totalSlots, description: activeFloor.description } : undefined} isSubmitting={submitting} error={submitError} onClose={() => setFloorModal(false)} onSubmit={saveFloor} />
    </AdminPageShell>
  )
}

