import { Button } from '@/components/ui/button'
import { useEffect, useMemo, useState } from 'react'
import {
  ManagerPageHeader,
  ManagerPlanDeleteDialog,
  ManagerPlanFilters,
  ManagerPlanFormModal,
  ManagerPlanList,
  ManagerPlanStats,
  type ManagerPlanStatusFilter,
  type ManagerPlanVehicleFilter,
} from '../../components/manager'
import {
  managerPlansApi,
  type ManagerPlan,
  type ManagerPlanCode,
  type ManagerPlanCreatePayload,
  type ManagerPlanUpdatePayload,
} from '../../services/managerPlansApi'

const PLAN_CODES: ManagerPlanCode[] = [
  'MOTO_MONTHLY',
  'MOTO_QUARTERLY',
  'CAR_MONTHLY',
  'CAR_QUARTERLY',
]

export function ManagerPlansPage() {
  const [plans, setPlans] = useState<ManagerPlan[]>([])
  const [vehicleFilter, setVehicleFilter] = useState<ManagerPlanVehicleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<ManagerPlanStatusFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [createNotice, setCreateNotice] = useState<string | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<ManagerPlan | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [planPendingDelete, setPlanPendingDelete] = useState<ManagerPlan | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  async function loadPlans() {
    setIsLoading(true)
    setError(null)
    try {
      const data = await managerPlansApi.getPlans()
      setPlans(data.plans)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách gói.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadPlans(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  const filteredPlans = useMemo(
    () =>
      plans.filter((plan) => {
        if (vehicleFilter !== 'all' && plan.vehicleType !== vehicleFilter) return false
        if (statusFilter !== 'all' && plan.isActive !== (statusFilter === 'active')) return false
        return true
      }),
    [plans, statusFilter, vehicleFilter],
  )

  const availableCodes = useMemo(
    () => PLAN_CODES.filter((code) => !plans.some((plan) => plan.code === code)),
    [plans],
  )

  async function handleSubmit(payload: ManagerPlanCreatePayload | ManagerPlanUpdatePayload) {
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      if (editingPlan) {
        const data = await managerPlansApi.updatePlan(editingPlan._id, payload as ManagerPlanUpdatePayload)
        setPlans((current) => current.map((plan) => (plan._id === data.plan._id ? data.plan : plan)))
      } else {
        const data = await managerPlansApi.createPlan(payload as ManagerPlanCreatePayload)
        setPlans((current) => [...current, data.plan])
      }

      setIsFormOpen(false)
      setEditingPlan(null)
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : editingPlan
            ? 'Không thể cập nhật gói.'
            : 'Không thể tạo gói.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenCreate() {
    if (availableCodes.length === 0) {
      setCreateNotice(
        'Hệ thống đã có đủ 4 loại gói được hỗ trợ. Bạn có thể chỉnh sửa, tạm dừng hoặc xóa một gói không còn được sử dụng trước khi tạo lại.',
      )
      return
    }
    setCreateNotice(null)
    setSubmitError(null)
    setEditingPlan(null)
    setIsFormOpen(true)
  }

  function handleOpenEdit(plan: ManagerPlan) {
    setSubmitError(null)
    setEditingPlan(plan)
    setIsFormOpen(true)
  }

  async function handleToggle(plan: ManagerPlan) {
    setUpdatingId(plan._id)
    setError(null)
    try {
      const data = await managerPlansApi.updatePlan(plan._id, { isActive: !plan.isActive })
      setPlans((current) => current.map((item) => (item._id === data.plan._id ? data.plan : item)))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái gói.')
    } finally {
      setUpdatingId(null)
    }
  }

  function handleOpenDelete(plan: ManagerPlan) {
    setDeleteError(null)
    setPlanPendingDelete(plan)
  }

  async function handleConfirmDelete() {
    if (!planPendingDelete) return

    setDeletingId(planPendingDelete._id)
    setDeleteError(null)
    try {
      await managerPlansApi.deletePlan(planPendingDelete._id)
      setPlans((current) => current.filter((plan) => plan._id !== planPendingDelete._id))
      setCreateNotice(null)
      setPlanPendingDelete(null)
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Không thể xóa gói.')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="relative mx-auto max-w-[118rem] p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Quản lý // Gói gửi xe"
        title="Quản lý gói gửi xe"
        description="Tạo mới, điều chỉnh giá, thời hạn, nội dung và trạng thái các gói đăng ký."
        actions={
          <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
            <ManagerPlanFilters
              vehicleFilter={vehicleFilter}
              statusFilter={statusFilter}
              onVehicleFilterChange={setVehicleFilter}
              onStatusFilterChange={setStatusFilter}
            />
            <Button
              type="button"
              className="h-10 shrink-0 px-5"
              onClick={handleOpenCreate}
            >
              Tạo gói
            </Button>
          </div>
        }
      />

      {createNotice && (
        <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-800 dark:text-amber-200">
          <div>
            <p className="font-semibold">Chưa thể tạo thêm gói</p>
            <p className="mt-1 leading-6">{createNotice}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={() => setCreateNotice(null)}>
            Đóng
          </Button>
        </div>
      )}

      <ManagerPlanStats plans={plans} isLoading={isLoading} />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-200">
          <span>{error}</span>
          <Button type="button" variant="outline" onClick={() => void loadPlans()}>
            Thử lại
          </Button>
        </div>
      )}

      <ManagerPlanList
        plans={filteredPlans}
        isLoading={isLoading}
        updatingId={updatingId}
        deletingId={deletingId}
        onEdit={handleOpenEdit}
        onToggle={(plan) => void handleToggle(plan)}
        onDelete={handleOpenDelete}
      />

      <ManagerPlanFormModal
        open={isFormOpen}
        plan={editingPlan}
        availableCodes={availableCodes}
        isSubmitting={isSubmitting}
        error={submitError}
        onClose={() => {
          if (isSubmitting) return
          setIsFormOpen(false)
          setEditingPlan(null)
        }}
        onSubmit={(payload) => void handleSubmit(payload)}
      />

      <ManagerPlanDeleteDialog
        plan={planPendingDelete}
        isDeleting={deletingId !== null}
        error={deleteError}
        onClose={() => {
          if (deletingId) return
          setPlanPendingDelete(null)
          setDeleteError(null)
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  )
}
