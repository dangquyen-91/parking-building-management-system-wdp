import type { AdminSubscription } from '../../../services/adminApi'
import { isSubscriptionExpiringSoon } from '../../../utils/managerSubscriptionUi'
import { Input } from '../../ui/input'
import { NativeSelect, NativeSelectOption } from '../../ui/native-select'
import { TableCell, TableRow } from '../../ui/table'
import { Card, CardContent } from '../../ui/card'
import { AdminStatCard } from '../common/AdminStatCard'
import { AdminStatusBadge } from '../common/AdminStatusBadge'
import { AdminTableShell } from '../common/AdminTableShell'
import {
  formatOperationDate,
  OperationEmpty,
} from '../operations/AdminOperationPrimitives'

export type AdminSubscriptionStatusFilter =
  | AdminSubscription['status']
  | 'all'
  | 'expiring'
export type AdminSubscriptionVehicleFilter =
  | AdminSubscription['vehicleType']
  | 'all'
export function AdminSubscriptionFilters(p: {
  query: string
  status: AdminSubscriptionStatusFilter
  vehicleType: AdminSubscriptionVehicleFilter
  onQueryChange: (v: string) => void
  onStatusChange: (v: AdminSubscriptionStatusFilter) => void
  onVehicleTypeChange: (v: AdminSubscriptionVehicleFilter) => void
}) {
  return (
    <Card>
      <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
        <Input
          type="search"
          value={p.query}
          onChange={(e) => p.onQueryChange(e.target.value)}
          placeholder="Tên, email, SĐT hoặc biển số"
        />
        <NativeSelect
          value={p.status}
          onChange={(e) =>
            p.onStatusChange(e.target.value as AdminSubscriptionStatusFilter)
          }
        >
          <NativeSelectOption value="all">Tất cả trạng thái</NativeSelectOption>
          <NativeSelectOption value="active">Đang hoạt động</NativeSelectOption>
          <NativeSelectOption value="expiring">Sắp hết hạn</NativeSelectOption>
          <NativeSelectOption value="pending">
            Chờ thanh toán
          </NativeSelectOption>
          <NativeSelectOption value="expired">Đã hết hạn</NativeSelectOption>
          <NativeSelectOption value="cancelled">Đã hủy</NativeSelectOption>
        </NativeSelect>
        <NativeSelect
          value={p.vehicleType}
          onChange={(e) =>
            p.onVehicleTypeChange(
              e.target.value as AdminSubscriptionVehicleFilter,
            )
          }
        >
          <NativeSelectOption value="all">Tất cả loại xe</NativeSelectOption>
          <NativeSelectOption value="motorcycle">Xe máy</NativeSelectOption>
          <NativeSelectOption value="car">Ô tô</NativeSelectOption>
        </NativeSelect>
      </CardContent>
    </Card>
  )
}
export function AdminSubscriptionStats({
  subscriptions,
  activePlates,
  snapshotTime,
}: {
  subscriptions: AdminSubscription[]
  activePlates: Set<string>
  snapshotTime: number
}) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard
        label="Tổng đăng ký"
        value={subscriptions.length}
        detail={`${subscriptions.filter((x) => x.status === 'pending').length} chờ thanh toán`}
        tone="violet"
      />
      <AdminStatCard
        label="Gói hoạt động"
        value={subscriptions.filter((x) => x.status === 'active').length}
        detail={`${subscriptions.filter((x) => x.status === 'expired').length} đã hết hạn`}
        tone="emerald"
      />
      <AdminStatCard
        label="Sắp hết hạn"
        value={
          subscriptions.filter((x) =>
            isSubscriptionExpiringSoon(x, snapshotTime),
          ).length
        }
        detail="Còn tối đa 7 ngày"
        tone="amber"
      />
      <AdminStatCard
        label="Xe gói trong bãi"
        value={
          subscriptions.filter((x) => activePlates.has(x.licensePlate)).length
        }
        detail="Có phiên đang hoạt động"
        tone="sky"
      />
    </div>
  )
}
export function AdminSubscriptionList({
  subscriptions,
  activePlates,
  snapshotTime,
  loading,
}: {
  subscriptions: AdminSubscription[]
  activePlates: Set<string>
  snapshotTime: number
  loading: boolean
}) {
  if (loading) return <OperationEmpty text="Đang tải người dùng gói..." />
  if (!subscriptions.length)
    return <OperationEmpty text="Không tìm thấy người dùng gói phù hợp." />
  return (
    <AdminTableShell
      eyebrow="Danh sách"
      title="Người đã đăng ký gói"
      countLabel={`${subscriptions.length} gói`}
      minWidth="1100px"
      columns={[
        { label: 'Biển số', className: 'w-[18%]' },
        { label: 'Người mua', className: 'w-[22%]' },
        { label: 'Gói đăng ký', className: 'w-[20%]' },
        { label: 'Thời hạn', className: 'w-[24%]' },
        { label: 'Trạng thái', className: 'w-[16%]' },
      ]}
    >
      {subscriptions.map((x) => {
        const owner = x.userId && typeof x.userId !== 'string' ? x.userId : null
        const plan = x.planId && typeof x.planId !== 'string' ? x.planId : null
        const slot = x.slotId && typeof x.slotId !== 'string' ? x.slotId : null
        const remaining =
          x.status === 'active' && x.endDate
            ? Math.max(
                0,
                Math.ceil(
                  (new Date(x.endDate).getTime() - snapshotTime) / 86_400_000,
                ),
              )
            : null
        return (
          <TableRow key={x._id}>
            <TableCell className="px-4 py-4">
              <p className="font-black tracking-[0.06em]">{x.licensePlate}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {x.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}
                {slot?.slotCode ? ` · ${slot.slotCode}` : ''}
              </p>
            </TableCell>
            <TableCell className="px-4 py-4">
              <p className="font-semibold">
                {owner?.fullName ?? 'Không xác định'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {owner?.email ?? owner?.phone ?? '-'}
              </p>
            </TableCell>
            <TableCell className="px-4 py-4">
              <p className="font-semibold">
                {plan?.name ?? plan?.code ?? 'Không xác định'}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {plan?.durationDays ?? 0} ngày sử dụng
              </p>
            </TableCell>
            <TableCell className="px-4 py-4">
              <p>
                {formatOperationDate(x.startDate)} -{' '}
                {formatOperationDate(x.endDate)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {remaining === null ? 'Chưa bắt đầu' : `Còn ${remaining} ngày`}
              </p>
            </TableCell>
            <TableCell className="px-4 py-4">
              <div className="flex flex-wrap gap-2">
                <AdminStatusBadge status={x.status} />
                {activePlates.has(x.licensePlate) && (
                  <AdminStatusBadge status="active" label="Trong bãi" />
                )}
              </div>
            </TableCell>
          </TableRow>
        )
      })}
    </AdminTableShell>
  )
}
