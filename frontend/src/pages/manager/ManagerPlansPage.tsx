import { useEffect, useMemo, useState } from 'react'
import {
  ManagerPageHeader,
  ManagerPlanFilters,
  ManagerPlanList,
  ManagerPlanStats,
  type ManagerPlanStatusFilter,
  type ManagerPlanVehicleFilter,
} from '../../components/manager'
import { ManagerPlanFormModal } from '../../components/manager/ManagerPlanFormModal'
import { managerPlansApi, type ManagerPlan, type ManagerPlanUpdatePayload } from '../../services/managerPlansApi'

export function ManagerPlansPage() {
  const [plans, setPlans] = useState<ManagerPlan[]>([])
  const [vehicleFilter, setVehicleFilter] = useState<ManagerPlanVehicleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<ManagerPlanStatusFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<ManagerPlan | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

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

  async function handleEdit(payload: ManagerPlanUpdatePayload) {
    if (!editingPlan) return
    setIsSubmitting(true)
    setSubmitError(null)
    try {
      const data = await managerPlansApi.updatePlan(editingPlan._id, payload)
      setPlans((current) => current.map((plan) => (plan._id === data.plan._id ? data.plan : plan)))
      setEditingPlan(null)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Không thể cập nhật gói.')
    } finally {
      setIsSubmitting(false)
    }
  }

  function handleOpenEdit(plan: ManagerPlan) {
    setSubmitError(null)
    setEditingPlan(plan)
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

  return (
    <div className="p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Quản lý // Gói gửi xe"
        title="Quản lý gói gửi xe"
        description="Điều chỉnh giá, thời hạn, nội dung và trạng thái các gói đăng ký."
        actions={
          <ManagerPlanFilters
            vehicleFilter={vehicleFilter}
            statusFilter={statusFilter}
            onVehicleFilterChange={setVehicleFilter}
            onStatusFilterChange={setStatusFilter}
          />
        }
      />

      <ManagerPlanStats plans={plans} isLoading={isLoading} />

      {error && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-theme bg-rose-500/10 p-4 text-sm text-rose-200">
          <span>{error}</span>
          <button type="button" className="font-semibold hover:underline" onClick={() => void loadPlans()}>Thử lại</button>
        </div>
      )}

      <ManagerPlanList
        plans={filteredPlans}
        isLoading={isLoading}
        updatingId={updatingId}
        onEdit={handleOpenEdit}
        onToggle={(plan) => void handleToggle(plan)}
      />

      <ManagerPlanFormModal
        plan={editingPlan}
        isSubmitting={isSubmitting}
        error={submitError}
        onClose={() => setEditingPlan(null)}
        onSubmit={(payload) => void handleEdit(payload)}
      />
    </div>
  )
}
