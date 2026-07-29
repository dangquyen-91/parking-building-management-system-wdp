import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import type { ManagerPlan } from '../../../services/managerPlansApi'
import {
  formatSubscriptionCurrency,
  VEHICLE_LABELS,
} from '../../../utils/subscriptionUi'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'
import { ManagerTableShell } from '../common/ManagerTableShell'

type ManagerPlanListProps = {
  plans: ManagerPlan[]
  isLoading: boolean
  updatingId: string | null
  deletingId: string | null
  onEdit: (plan: ManagerPlan) => void
  onToggle: (plan: ManagerPlan) => void
  onDelete: (plan: ManagerPlan) => void
}

export function ManagerPlanList({
  plans,
  isLoading,
  updatingId,
  deletingId,
  onEdit,
  onToggle,
  onDelete,
}: ManagerPlanListProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg bg-card p-4 text-sm text-muted-foreground ring-1 ring-border">
        Đang tải danh sách gói...
      </div>
    )
  }

  if (plans.length === 0) {
    return (
      <div className="rounded-lg bg-card p-4 text-sm text-muted-foreground ring-1 ring-border">
        Không có gói nào phù hợp với bộ lọc.
      </div>
    )
  }

  return (
    <ManagerTableShell
      eyebrow="Danh sách gói"
      title="Gói cư dân"
      countLabel={`${plans.length} gói`}
      minWidth="1120px"
      columns={[
        { label: 'Gói', className: 'w-[24%]' },
        { label: 'Loại xe', className: 'w-[11%]' },
        { label: 'Thời hạn', className: 'w-[10%]' },
        { label: 'Giá', className: 'w-[14%]' },
        { label: 'Trạng thái', className: 'w-[15%]' },
        { label: 'Thao tác', className: 'w-[26%] text-right' },
      ]}
    >
      {plans.map((plan) => {
        const isBusy = updatingId === plan._id || deletingId === plan._id

        return (
          <TableRow key={plan._id}>
            <TableCell className="px-4 py-4">
              <p className="font-bold text-foreground">{plan.name}</p>
              <p
                className="mt-1 truncate text-xs text-muted-foreground"
                title={plan.description || plan.code}
              >
                {plan.code} · {plan.description || 'Chưa có mô tả'}
              </p>
            </TableCell>
            <TableCell className="px-4 py-4 font-medium text-foreground">
              {VEHICLE_LABELS[plan.vehicleType]}
            </TableCell>
            <TableCell className="px-4 py-4 text-foreground">
              {plan.durationDays} ngày
            </TableCell>
            <TableCell className="px-4 py-4 font-bold text-foreground">
              {formatSubscriptionCurrency(plan.price)}
            </TableCell>
            <TableCell className="px-4 py-4">
              <ManagerStatusBadge
                status={plan.isActive ? 'active' : 'inactive'}
                label={plan.isActive ? 'Đang mở bán' : 'Tạm dừng'}
              />
            </TableCell>
            <TableCell className="px-4 py-4">
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={isBusy}
                  onClick={() => onEdit(plan)}
                >
                  Chỉnh sửa
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant={plan.isActive ? 'secondary' : 'outline'}
                  disabled={isBusy}
                  onClick={() => onToggle(plan)}
                >
                  {updatingId === plan._id
                    ? 'Đang cập nhật...'
                    : plan.isActive
                      ? 'Tạm dừng'
                      : 'Mở lại'}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  disabled={isBusy}
                  onClick={() => onDelete(plan)}
                >
                  {deletingId === plan._id ? 'Đang xóa...' : 'Xóa'}
                </Button>
              </div>
            </TableCell>
          </TableRow>
        )
      })}
    </ManagerTableShell>
  )
}
