import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type {
  ManagerSubscription,
  ManagerSubscriptionStatus,
} from '../../../services/managerSubscriptionsApi'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'

const statusLabels: Record<ManagerSubscriptionStatus, string> = {
  pending: 'Chờ thanh toán',
  active: 'Đang hoạt động',
  expired: 'Đã hết hạn',
  cancelled: 'Đã hủy',
}

type ManagerSubscriptionDetailsDialogProps = {
  subscription: ManagerSubscription
  isInParkingLot: boolean
  trigger: ReactNode
}

export function ManagerSubscriptionDetailsDialog({
  subscription,
  isInParkingLot,
  trigger,
}: ManagerSubscriptionDetailsDialogProps) {
  const owner = subscription.userId && typeof subscription.userId !== 'string' ? subscription.userId : null
  const plan = subscription.planId && typeof subscription.planId !== 'string' ? subscription.planId : null
  const slot = subscription.slotId && typeof subscription.slotId !== 'string' ? subscription.slotId : null

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border bg-linear-to-br from-sky-500/10 via-transparent to-emerald-500/10 p-6 pr-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
              {subscription.vehicleType === 'car' ? 'Ô tô' : 'Xe máy'}
            </span>
            <ManagerStatusBadge
              status={subscription.status}
              label={statusLabels[subscription.status]}
            />
            {isInParkingLot && <ManagerStatusBadge status="checkin" label="Đang trong bãi" />}
          </div>
          <DialogTitle className="text-3xl font-black tracking-[0.08em] text-foreground">
            {subscription.licensePlate}
          </DialogTitle>
          <DialogDescription>
            Thông tin người mua, gói đăng ký, thời hạn và vị trí đỗ của phương tiện.
          </DialogDescription>
        </DialogHeader>

        <section className="grid gap-4 p-6 sm:grid-cols-2">
          <DetailItem label="Người mua" value={owner?.fullName || 'Không xác định'} />
          <DetailItem label="Số điện thoại" value={owner?.phone || 'Chưa cập nhật'} />
          <DetailItem label="Email" value={owner?.email || 'Chưa cập nhật'} wide />
        </section>

        <section className="border-t border-border bg-background/45 p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
            Thông tin gói
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <HighlightItem label="Gói đăng ký" value={plan?.name || plan?.code || 'Không xác định'} tone="sky" />
            <HighlightItem label="Giá gói" value={formatCurrency(plan?.price)} tone="emerald" />
            <DetailItem label="Mã gói" value={plan?.code || '-'} />
            <DetailItem
              label="Thời lượng"
              value={plan?.durationDays ? `${plan.durationDays} ngày` : 'Chưa xác định'}
            />
            <DetailItem label="Ngày bắt đầu" value={formatDate(subscription.startDate)} />
            <DetailItem label="Ngày kết thúc" value={formatDate(subscription.endDate)} />
            <DetailItem label="Ngày đăng ký" value={formatDateTime(subscription.createdAt)} />
            <DetailItem
              label="Vị trí đỗ"
              value={slot?.slotCode || (subscription.vehicleType === 'motorcycle' ? 'Sức chứa chung' : 'Chưa cấp ô')}
            />
            {subscription.note && <DetailItem label="Ghi chú" value={subscription.note} wide />}
          </div>
        </section>
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({
  label,
  value,
  wide = false,
}: {
  label: string
  value: string
  wide?: boolean
}) {
  return (
    <div className={['rounded-2xl border border-border bg-card p-4', wide ? 'sm:col-span-2' : ''].join(' ')}>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 wrap-break-word font-semibold text-foreground">{value}</p>
    </div>
  )
}

function HighlightItem({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'sky' | 'emerald'
}) {
  const toneClass = tone === 'sky'
    ? 'border-sky-400/30 bg-sky-500/10'
    : 'border-emerald-400/30 bg-emerald-500/10'

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-black text-foreground">{value}</p>
    </div>
  )
}

function formatDate(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatDateTime(value?: string | null) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatCurrency(value?: number) {
  if (typeof value !== 'number') return 'Chưa xác định'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}
