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
  ManagerBooking,
  ManagerBookingStatus,
} from '../../../services/managerBookingsApi'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'

const statusLabels: Record<ManagerBookingStatus, string> = {
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
  used: 'Đã sử dụng',
  expired: 'Hết hạn',
  cancelled: 'Đã hủy',
}

const statusTones: Record<
  ManagerBookingStatus,
  'pending' | 'confirmed' | 'checkout' | 'expired' | 'cancelled'
> = {
  pending: 'pending',
  paid: 'confirmed',
  used: 'checkout',
  expired: 'expired',
  cancelled: 'cancelled',
}

type ManagerBookingDetailsDialogProps = {
  booking: ManagerBooking
  trigger: ReactNode
}

export function ManagerBookingDetailsDialog({
  booking,
  trigger,
}: ManagerBookingDetailsDialogProps) {
  const customer = booking.userId && typeof booking.userId !== 'string'
    ? booking.userId
    : null
  const session = booking.sessionId && typeof booking.sessionId !== 'string'
    ? booking.sessionId
    : null

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border bg-linear-to-br from-sky-500/10 via-transparent to-violet-500/10 p-6 pr-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
              Ô tô
            </span>
            <ManagerStatusBadge
              status={statusTones[booking.status]}
              label={statusLabels[booking.status]}
            />
          </div>
          <DialogTitle className="text-3xl font-black tracking-[0.08em] text-foreground">
            {booking.licensePlate}
          </DialogTitle>
          <DialogDescription>
            Thông tin khách hàng, thời gian đặt chỗ, chi phí và trạng thái sử dụng booking.
          </DialogDescription>
        </DialogHeader>

        <section className="grid gap-4 p-6 sm:grid-cols-2">
          <HighlightItem
            label="Thời gian đến dự kiến"
            value={formatDateTime(booking.expectedArrivalTime)}
            tone="sky"
          />
          <HighlightItem
            label="Thời gian rời dự kiến"
            value={formatDateTime(booking.expectedExitTime)}
            tone="violet"
          />
          <DetailItem label="Thời lượng đặt" value={`${booking.durationHours} giờ`} />
          <DetailItem label="Số tiền" value={formatCurrency(booking.amount)} />
          <DetailItem label="Ngày tạo booking" value={formatDateTime(booking.createdAt)} />
          <DetailItem
            label="Thời điểm sử dụng"
            value={booking.usedAt ? formatDateTime(booking.usedAt) : 'Chưa sử dụng'}
          />
        </section>

        <section className="border-t border-border bg-background/45 p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
            Khách hàng và phiên gửi xe
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailItem label="Khách hàng" value={customer?.fullName || 'Khách chưa đăng nhập'} />
            <DetailItem label="Số điện thoại" value={booking.phone || customer?.phone || 'Chưa cập nhật'} />
            <DetailItem label="Email" value={customer?.email || 'Chưa cập nhật'} wide />
            <DetailItem label="Mã booking" value={booking._id} wide />
            <DetailItem
              label="Trạng thái phiên"
              value={session?.status ? formatSessionStatus(session.status) : 'Chưa tạo phiên gửi xe'}
            />
            <DetailItem
              label="Thời gian vào thực tế"
              value={session?.entryTime ? formatDateTime(session.entryTime) : 'Chưa vào bãi'}
            />
            <DetailItem
              label="Thời gian ra thực tế"
              value={session?.exitTime ? formatDateTime(session.exitTime) : 'Chưa ra khỏi bãi'}
            />
            {session?._id && <DetailItem label="Mã phiên gửi xe" value={session._id} wide />}
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
  tone: 'sky' | 'violet'
}) {
  const toneClass = tone === 'sky'
    ? 'border-sky-400/30 bg-sky-500/10'
    : 'border-violet-400/30 bg-violet-500/10'

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-black text-foreground">{value}</p>
    </div>
  )
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

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatSessionStatus(status: string) {
  if (status === 'active') return 'Đang trong bãi'
  if (status === 'completed') return 'Đã ra khỏi bãi'
  if (status === 'cancelled') return 'Đã hủy'
  return status
}
