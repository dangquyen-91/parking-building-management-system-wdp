import type { ManagerSubscription, ManagerSubscriptionStatus } from '../../../services/managerSubscriptionsApi'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'
import { ManagerTableShell } from '../common/ManagerTableShell'
import { ManagerSubscriptionDetailsDialog } from './ManagerSubscriptionDetailsDialog'

const STATUS_LABELS: Record<ManagerSubscriptionStatus, string> = { pending: 'Chờ thanh toán', active: 'Đang hoạt động', expired: 'Đã hết hạn', cancelled: 'Đã hủy' }
function formatDate(value?: string | null) { return value ? new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value)) : '-' }
function getRemainingDays(item: ManagerSubscription, now: number) { return item.status === 'active' && item.endDate ? Math.max(0, Math.ceil((new Date(item.endDate).getTime() - now) / 86_400_000)) : null }

export function ManagerSubscriptionList({ subscriptions, activePlates, snapshotTime, loading }: { subscriptions: ManagerSubscription[]; activePlates: Set<string>; snapshotTime: number; loading: boolean }) {
  if (loading) return <div className="rounded-lg bg-card p-10 text-center text-sm text-muted-foreground ring-1 ring-border">Đang tải người dùng gói...</div>
  if (!subscriptions.length) return <div className="rounded-lg bg-card p-10 text-center text-sm text-muted-foreground ring-1 ring-border">Không tìm thấy người dùng gói phù hợp.</div>
  return (
    <ManagerTableShell eyebrow="Danh sách" title="Người đã đăng ký gói" countLabel={`${subscriptions.length} người dùng`} minWidth="1180px" columns={[
      { label: 'Biển số', className: 'w-[17%]' }, { label: 'Người mua', className: 'w-[19%]' }, { label: 'Gói đăng ký', className: 'w-[19%]' }, { label: 'Thời hạn', className: 'w-[21%]' }, { label: 'Trạng thái', className: 'w-[13%]' }, { label: 'Thao tác', className: 'w-[11%] text-right' },
    ]}>
      {subscriptions.map((item) => {
        const owner = item.userId && typeof item.userId !== 'string' ? item.userId : null
        const plan = item.planId && typeof item.planId !== 'string' ? item.planId : null
        const slot = item.slotId && typeof item.slotId !== 'string' ? item.slotId : null
        const days = getRemainingDays(item, snapshotTime)
        return <TableRow key={item._id}>
          <TableCell className="px-4 py-4"><div className="flex flex-wrap items-center gap-2"><p className="font-black tracking-[0.06em] text-foreground">{item.licensePlate}</p>{activePlates.has(item.licensePlate) && <ManagerStatusBadge status="checkin" label="Đang trong bãi" />}</div><p className="mt-1 text-xs text-muted-foreground">{item.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}{slot?.slotCode ? ` · Vị trí ${slot.slotCode}` : ''}</p></TableCell>
          <TableCell className="px-4 py-4"><p className="truncate font-semibold text-foreground">{owner?.fullName ?? 'Không xác định'}</p><p className="mt-1 truncate text-xs text-muted-foreground">{owner?.email ?? owner?.phone ?? '-'}</p></TableCell>
          <TableCell className="px-4 py-4"><p className="truncate font-semibold text-foreground">{plan?.name ?? plan?.code ?? 'Không xác định'}</p><p className="mt-1 text-xs text-muted-foreground">Mua ngày {formatDate(item.createdAt)}</p></TableCell>
          <TableCell className="px-4 py-4"><p className="font-medium text-foreground">{formatDate(item.startDate)} - {formatDate(item.endDate)}</p><p className="mt-1 text-xs text-muted-foreground">{days === null ? 'Chưa bắt đầu sử dụng' : `Còn ${days} ngày`}</p></TableCell>
          <TableCell className="px-4 py-4"><ManagerStatusBadge status={item.status} label={STATUS_LABELS[item.status]} /></TableCell>
          <TableCell className="px-4 py-4 text-right">
            <ManagerSubscriptionDetailsDialog
              subscription={item}
              isInParkingLot={activePlates.has(item.licensePlate)}
              trigger={<Button type="button" variant="outline" size="sm">Xem chi tiết</Button>}
            />
          </TableCell>
        </TableRow>
      })}
    </ManagerTableShell>
  )
}
