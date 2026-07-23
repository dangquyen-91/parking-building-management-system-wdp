import type { ManagerPlan } from '../../../services/managerPlansApi'
import { formatSubscriptionCurrency, VEHICLE_LABELS } from '../../../utils/subscriptionUi'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'
import { ManagerTableShell } from '../common/ManagerTableShell'

type ManagerPlanListProps = {
  plans: ManagerPlan[]; isLoading: boolean; updatingId: string | null
  onEdit: (plan: ManagerPlan) => void; onToggle: (plan: ManagerPlan) => void
}

export function ManagerPlanList({ plans, isLoading, updatingId, onEdit, onToggle }: ManagerPlanListProps) {
  if (isLoading) return <div className="rounded-lg bg-card p-4 text-sm text-muted-foreground ring-1 ring-border">Đang tải danh sách gói...</div>
  if (plans.length === 0) return <div className="rounded-lg bg-card p-4 text-sm text-muted-foreground ring-1 ring-border">Không có gói nào phù hợp với bộ lọc.</div>

  return (
    <ManagerTableShell
      eyebrow="Danh sách gói" title="Gói cư dân" countLabel={`${plans.length} gói`} minWidth="1050px"
      columns={[
        { label: 'Gói', className: 'w-[25%]' }, { label: 'Loại xe', className: 'w-[12%]' },
        { label: 'Thời hạn', className: 'w-[11%]' }, { label: 'Giá', className: 'w-[15%]' },
        { label: 'Trạng thái', className: 'w-[16%]' }, { label: 'Thao tác', className: 'w-[21%] text-right' },
      ]}
    >
      {plans.map((plan) => (
        <TableRow key={plan._id}>
          <TableCell className="px-4 py-4"><p className="font-bold text-foreground">{plan.name}</p><p className="mt-1 truncate text-xs text-muted-foreground" title={plan.description || plan.code}>{plan.code} · {plan.description || 'Chưa có mô tả'}</p></TableCell>
          <TableCell className="px-4 py-4 font-medium text-foreground">{VEHICLE_LABELS[plan.vehicleType]}</TableCell>
          <TableCell className="px-4 py-4 text-foreground">{plan.durationDays} ngày</TableCell>
          <TableCell className="px-4 py-4 font-bold text-foreground">{formatSubscriptionCurrency(plan.price)}</TableCell>
          <TableCell className="px-4 py-4"><ManagerStatusBadge status={plan.isActive ? 'active' : 'inactive'} label={plan.isActive ? 'Đang mở bán' : 'Tạm dừng'} /></TableCell>
          <TableCell className="px-4 py-4"><div className="flex justify-end gap-2"><Button type="button" size="sm" onClick={() => onEdit(plan)}>Chỉnh sửa</Button><Button type="button" size="sm" variant={plan.isActive ? 'destructive' : 'outline'} disabled={updatingId === plan._id} onClick={() => onToggle(plan)}>{updatingId === plan._id ? 'Đang cập nhật...' : plan.isActive ? 'Tạm dừng' : 'Mở lại'}</Button></div></TableCell>
        </TableRow>
      ))}
    </ManagerTableShell>
  )
}
