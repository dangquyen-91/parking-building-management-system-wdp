import { useMemo, useState } from 'react'
import { ManagerBuildingCard } from '../../components/manager/ManagerBuildingCard'
import { ManagerBuildingFormModal } from '../../components/manager/ManagerBuildingFormModal'
import { ManagerFloorFormModal } from '../../components/manager/ManagerFloorFormModal'
import { ManagerPageHeader, ManagerStatCard } from '../../components/manager'
import { managerBuildingsApi, type BuildingPayload, type FloorPayload, type FloorUpdatePayload } from '../../services/managerBuildingsApi'
import { useManagerBuildings, type ManagerBuildingSummary } from '../../hooks/useManagerBuildings'

export function ManagerBuildingsPage() {
  const { summaries, isLoading, error, reload } = useManagerBuildings()
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [activeBuilding, setActiveBuilding] = useState<ManagerBuildingSummary | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [floorModalOpen, setFloorModalOpen] = useState(false)
  const [floorModalMode, setFloorModalMode] = useState<'create' | 'edit'>('create')
  const [activeFloor, setActiveFloor] = useState<ManagerBuildingSummary['floors'][number] | null>(null)
  const [floorSubmitError, setFloorSubmitError] = useState<string | null>(null)
  const [isFloorSubmitting, setIsFloorSubmitting] = useState(false)

  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [buildingFilter, setBuildingFilter] = useState('all')

  const filteredSummaries = useMemo(() => {
    return summaries.filter((building) => {
      if (statusFilter !== 'all') {
        const isActive = statusFilter === 'active'
        if (building.isActive !== isActive) return false
      }

      if (buildingFilter !== 'all' && building.id !== buildingFilter) return false

      return true
    })
  }, [summaries, statusFilter, buildingFilter])

  const filteredTotals = useMemo(() => {
    return filteredSummaries.reduce(
      (acc, building) => {
        acc.buildings += 1
        acc.floors += building.floorCount
        acc.slots += building.totalSlots
        return acc
      },
      { buildings: 0, floors: 0, slots: 0 },
    )
  }, [filteredSummaries])

  const buildingValue = isLoading ? '-' : filteredTotals.buildings
  const floorValue = isLoading ? '-' : filteredTotals.floors
  const slotValue = isLoading ? '-' : filteredTotals.slots

  function handleOpenCreate() {
    setModalMode('create')
    setActiveBuilding(null)
    setSubmitError(null)
    setModalOpen(true)
  }

  function handleOpenCreateFloor() {
    setFloorModalMode('create')
    setActiveFloor(null)
    setFloorSubmitError(null)
    setFloorModalOpen(true)
  }

  function handleOpenEditFloor(floor: ManagerBuildingSummary['floors'][number]) {
    setFloorModalMode('edit')
    setActiveFloor(floor)
    setFloorSubmitError(null)
    setFloorModalOpen(true)
  }

  function handleOpenEdit(building: ManagerBuildingSummary) {
    setModalMode('edit')
    setActiveBuilding(building)
    setSubmitError(null)
    setModalOpen(true)
  }

  async function handleSubmit(payload: BuildingPayload) {
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      if (modalMode === 'create') {
        await managerBuildingsApi.createBuilding(payload)
      } else if (activeBuilding) {
        await managerBuildingsApi.updateBuilding(activeBuilding.id, payload)
      }

      await reload()
      setModalOpen(false)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Không thể lưu tòa nhà.')
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleFloorSubmit(payload: FloorPayload, floorId?: string) {
    setIsFloorSubmitting(true)
    setFloorSubmitError(null)

    try {
      if (floorModalMode === 'create') {
        await managerBuildingsApi.createFloor(payload)
      } else if (floorId) {
        const { buildingId: _buildingId, ...updatePayload } = payload
        await managerBuildingsApi.updateFloor(floorId, updatePayload as FloorUpdatePayload)
      }
      await reload()
      setFloorModalOpen(false)
    } catch (err) {
      setFloorSubmitError(err instanceof Error ? err.message : 'Không thể tạo tầng.')
    } finally {
      setIsFloorSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Quản lý // Tòa nhà"
        title="Tổng quan tòa nhà"
        description="Xem chi tiết tòa nhà, danh sách tầng và tổng sức chứa."
        actions={
          <div className="grid w-full gap-3 lg:min-w-[36rem] lg:max-w-[42rem]">
            <div className="flex flex-col gap-3 rounded-lg border border-theme bg-badge/60 p-3 sm:flex-row sm:items-end sm:justify-between">
              <div className="grid flex-1 gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-xs font-medium text-subtle">
                  Trạng thái
                  <select
                    className="h-10 w-full rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-btn-primary"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Ngừng hoạt động</option>
                  </select>
                </label>
                <label className="grid gap-1 text-xs font-medium text-subtle">
                  Tên tòa nhà
                  <select
                    className="h-10 w-full rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none transition focus:border-btn-primary"
                    value={buildingFilter}
                    onChange={(event) => setBuildingFilter(event.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    {summaries.map((building) => (
                      <option key={building.id} value={building.id}>
                        {building.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  className="h-10 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition hover:opacity-90"
                  onClick={handleOpenCreate}
                >
                  Tạo tòa nhà
                </button>
                <button
                  type="button"
                  className="h-10 rounded-lg border border-theme px-4 text-sm font-semibold text-fg transition hover:bg-badge"
                  onClick={handleOpenCreateFloor}
                >
                  Tạo tầng
                </button>
              </div>
            </div>
          </div>
        }
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <ManagerStatCard label="Tòa nhà" value={buildingValue} detail="Tất cả tòa nhà" />
        <ManagerStatCard label="Tầng" value={floorValue} detail="Tổng số tầng" />
        <ManagerStatCard label="Tổng chỗ đỗ" value={slotValue} detail="Tổng sức chứa" />
      </div>

      {error && (
        <div className="liquid-glass-card rounded-lg border border-theme bg-badge p-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {!error && isLoading && (
        <div className="liquid-glass-card rounded-lg border border-theme bg-badge p-4 text-sm text-muted">
          Đang tải dữ liệu tòa nhà...
        </div>
      )}

      {!error && !isLoading && filteredSummaries.length === 0 && (
        <div className="liquid-glass-card rounded-lg border border-theme bg-badge p-4 text-sm text-muted">
          Không có tòa nhà nào phù hợp với bộ lọc hiện tại.
        </div>
      )}

      {!error && !isLoading && filteredSummaries.length > 0 && (
        <section className="grid gap-4">
          {filteredSummaries.map((building) => (
            <ManagerBuildingCard
              key={building.id}
              building={building}
              onEdit={handleOpenEdit}
              onEditFloor={handleOpenEditFloor}
            />
          ))}
        </section>
      )}

      <ManagerBuildingFormModal
        open={modalOpen}
        mode={modalMode}
        initialValues={
          activeBuilding
            ? {
                name: activeBuilding.name,
                address: activeBuilding.address,
                description: activeBuilding.description,
              }
            : undefined
        }
        isSubmitting={isSubmitting}
        error={submitError}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmit}
      />

      <ManagerFloorFormModal
        open={floorModalOpen}
        mode={floorModalMode}
        buildings={summaries}
        floorId={activeFloor?.id}
        initialValues={
          activeFloor
            ? {
                buildingId: activeFloor.buildingId,
                floorNumber: activeFloor.floorNumber,
                vehicleType: activeFloor.vehicleType,
                floorType: activeFloor.floorType,
                totalSlots: activeFloor.totalSlots,
                description: activeFloor.description,
              }
            : undefined
        }
        isSubmitting={isFloorSubmitting}
        error={floorSubmitError}
        onClose={() => setFloorModalOpen(false)}
        onSubmit={handleFloorSubmit}
      />
    </div>
  )
}
