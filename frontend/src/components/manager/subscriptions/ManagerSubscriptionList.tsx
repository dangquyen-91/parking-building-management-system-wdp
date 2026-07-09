import type {
  ManagerSubscription,
  ManagerSubscriptionStatus,
} from '../../../services/managerSubscriptionsApi'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'

const STATUS_LABELS: Record<ManagerSubscriptionStatus, string> = {
  pending: 'Chờ thanh toán',
  active: 'Đang hoạt động',
  expired: 'Đã hết hạn',
  cancelled: 'Đã hủy',
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  return new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(value))
}

function getRemainingDays(subscription: ManagerSubscription, snapshotTime: number) {
  if (subscription.status !== 'active' || !subscription.endDate) return null
  return Math.max(0, Math.ceil((new Date(subscription.endDate).getTime() - snapshotTime) / 86_400_000))
}

export function ManagerSubscriptionList({
  subscriptions,
  activePlates,
  snapshotTime,
  loading,
}: {
  subscriptions: ManagerSubscription[]
  activePlates: Set<string>
  snapshotTime: number
  loading: boolean
}) {
  if (loading) {
    return <div className="bg-card text-card-foreground ring-1 ring-border rounded-lg p-10 text-center text-sm text-muted-foreground">Đang tải người dùng gói...</div>
  }
  if (subscriptions.length === 0) {
    return <div className="bg-card text-card-foreground ring-1 ring-border rounded-lg p-10 text-center text-sm text-muted-foreground">Không tìm thấy người dùng gói phù hợp.</div>
  }

  return (
    <section className="bg-card text-card-foreground ring-1 ring-border rounded-lg p-4 md:p-5">
      <div className="mb-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Danh sách</p>
        <h2 className="mt-1 text-base font-semibold text-foreground">Người đã đăng ký gói</h2>
      </div>
      <div className="space-y-3">
        {subscriptions.map((subscription) => {
          const owner = subscription.userId && typeof subscription.userId !== 'string' ? subscription.userId : null
          const plan = subscription.planId && typeof subscription.planId !== 'string' ? subscription.planId : null
          const slot = subscription.slotId && typeof subscription.slotId !== 'string' ? subscription.slotId : null
          const remainingDays = getRemainingDays(subscription, snapshotTime)

          return (
            <article key={subscription._id} className="rounded-lg border border-border bg-card p-4">
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-[1.15fr_1fr_1fr_1fr_auto] xl:items-center">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Biển số xe</p>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-lg font-semibold text-foreground">{subscription.licensePlate}</p>
                    {activePlates.has(subscription.licensePlate) && <ManagerStatusBadge status="checkin" label="Đang trong bãi" />}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {subscription.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}{slot?.slotCode ? ` · Vị trí ${slot.slotCode}` : ''}
                  </p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Người mua</p>
                  <p className="mt-1 truncate font-medium text-foreground">{owner?.fullName ?? 'Không xác định'}</p>
                  <p className="mt-1 truncate text-xs text-muted-foreground">{owner?.email ?? owner?.phone ?? '-'}</p>
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground">Gói đăng ký</p>
                  <p className="mt-1 truncate font-medium text-foreground">{plan?.name ?? plan?.code ?? 'Không xác định'}</p>
                  <p className="mt-1 text-xs text-muted-foreground">Mua ngày {formatDate(subscription.createdAt)}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Thời hạn</p>
                  <p className="mt-1 font-medium text-foreground">{formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {remainingDays === null ? 'Chưa bắt đầu sử dụng' : `Còn ${remainingDays} ngày`}
                  </p>
                </div>
                <ManagerStatusBadge status={subscription.status} label={STATUS_LABELS[subscription.status]} />
              </div>
              {subscription.note && <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">{subscription.note}</p>}
            </article>
          )
        })}
      </div>
    </section>
  )
}


