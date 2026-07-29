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
  GatePaymentStatus,
  GateSession,
  GateSessionStatus,
  GateUser,
} from '../../../services/staffGateApi'
import {
  formatSessionCustomer,
  formatSessionSpot,
  formatVehicleType,
} from '../../staff/data/staffGateUtils'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'

const statusBadges: Record<
  GateSessionStatus,
  { status: 'active' | 'checkout' | 'cancelled'; label: string }
> = {
  active: { status: 'active', label: 'Đang trong bãi' },
  completed: { status: 'checkout', label: 'Đã ra' },
  cancelled: { status: 'cancelled', label: 'Đã hủy' },
}

const paymentLabels: Record<GatePaymentStatus, string> = {
  unpaid: 'Chưa thanh toán',
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
}

type ManagerGateLogDetailsDialogProps = {
  session: GateSession
  trigger: ReactNode
}

export function ManagerGateLogDetailsDialog({
  session,
  trigger,
}: ManagerGateLogDetailsDialogProps) {
  const status = statusBadges[session.status]
  const user = session.userId && typeof session.userId !== 'string' ? session.userId : null

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border bg-linear-to-br from-sky-500/10 via-transparent to-violet-500/10 p-6 pr-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">
              {formatVehicleType(session.vehicleType)}
            </span>
            <span className="rounded-full border border-border bg-background/70 px-3 py-1 text-xs font-bold text-foreground">
              {formatSessionCustomer(session)}
            </span>
            <ManagerStatusBadge status={status.status} label={status.label} />
          </div>
          <DialogTitle className="text-3xl font-black tracking-[0.08em] text-foreground">
            {session.licensePlate}
          </DialogTitle>
          <DialogDescription>
            Chi tiết phiên gửi xe, thời gian, vị trí, nhân viên ghi nhận và thanh toán.
          </DialogDescription>
        </DialogHeader>

        <section className="grid gap-4 p-6 sm:grid-cols-2">
          <HighlightItem label="Thời gian vào" value={formatDateTime(session.entryTime)} tone="sky" />
          <HighlightItem
            label="Thời gian ra"
            value={session.exitTime ? formatDateTime(session.exitTime) : 'Xe chưa ra khỏi bãi'}
            tone="violet"
          />
          <DetailItem label="Thời lượng gửi" value={formatDuration(session.entryTime, session.exitTime)} />
          <DetailItem label="Vị trí đỗ" value={formatSessionSpot(session)} />
          <DetailItem label="Nhân viên cho xe vào" value={getStaffName(session.staffId)} />
          <DetailItem label="Nhân viên cho xe ra" value={getStaffName(session.checkOutStaffId)} />
        </section>

        <section className="border-t border-border bg-background/45 p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
            Khách hàng và thanh toán
          </p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <DetailItem
              label="Khách hàng"
              value={user?.fullName || (session.customerType === 'resident' ? 'Cư dân' : 'Khách vãng lai')}
            />
            <DetailItem label="Liên hệ" value={user?.phone || user?.email || 'Chưa có thông tin'} />
            <DetailItem label="Trạng thái thanh toán" value={paymentLabels[session.paymentStatus]} />
            <DetailItem label="Phương thức thanh toán" value={formatPaymentMethod(session.paymentMethod)} />
            <HighlightItem label="Phí phiên gửi xe" value={formatCurrency(session.fee)} tone="emerald" />
            <DetailItem
              label="Loại phiên"
              value={session.bookingId ? 'Khách đặt chỗ trước' : formatSessionCustomer(session)}
            />
            <DetailItem label="Mã phiên" value={session._id} wide />
            {session.bookingId && <DetailItem label="Mã booking" value={session.bookingId} wide />}
            {session.note && <DetailItem label="Ghi chú" value={session.note} wide />}
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
  tone: 'sky' | 'violet' | 'emerald'
}) {
  const toneClass = {
    sky: 'border-sky-400/30 bg-sky-500/10',
    violet: 'border-violet-400/30 bg-violet-500/10',
    emerald: 'border-emerald-400/30 bg-emerald-500/10',
  }[tone]

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-black text-foreground">{value}</p>
    </div>
  )
}

function getStaffName(staff?: GateUser | string | null) {
  if (!staff) return 'Chưa có'
  return typeof staff === 'string' ? staff : staff.fullName || staff.email || 'Không xác định'
}

function formatDateTime(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Không xác định'

  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date)
}

function formatDuration(entryTime: string, exitTime?: string) {
  const start = new Date(entryTime).getTime()
  const end = exitTime ? new Date(exitTime).getTime() : Date.now()
  if (!Number.isFinite(start) || !Number.isFinite(end)) return 'Không xác định'

  const minutes = Math.max(0, Math.floor((end - start) / 60_000))
  const hours = Math.floor(minutes / 60)
  return hours > 0 ? `${hours} giờ ${minutes % 60} phút` : `${minutes} phút`
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(value)
}

function formatPaymentMethod(method?: GateSession['paymentMethod']) {
  if (method === 'cash') return 'Tiền mặt'
  if (method === 'transfer') return 'Chuyển khoản'
  return 'Chưa chọn'
}
