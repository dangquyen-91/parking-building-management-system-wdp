import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { ManagerStaffUser } from '../../../services/managerStaffApi'
import type { GateSession } from '../../../services/staffGateApi'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'

type ManagerStaffDetailsDialogProps = {
  staff: ManagerStaffUser
  sessions: GateSession[]
  trigger: ReactNode
}

const vehicleLabels = {
  motorcycle: 'Xe máy',
  car: 'Ô tô',
} as const

const customerLabels = {
  resident: 'Cư dân',
  walk_in: 'Khách vãng lai',
} as const

const paymentLabels = {
  unpaid: 'Chưa thanh toán',
  pending: 'Chờ thanh toán',
  paid: 'Đã thanh toán',
} as const

export function ManagerStaffDetailsDialog({
  staff,
  sessions,
  trigger,
}: ManagerStaffDetailsDialogProps) {
  const staffSessions = sessions.filter((session) => {
    const staffId = typeof session.staffId === 'string' ? session.staffId : session.staffId?._id
    return staffId === staff._id
  })
  const carCount = staffSessions.filter((session) => session.vehicleType === 'car').length
  const motorcycleCount = staffSessions.length - carCount

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border bg-gradient-to-br from-sky-500/10 via-transparent to-emerald-500/10 p-6 pr-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid size-11 place-items-center rounded-2xl border border-border bg-background/70 text-sm font-black text-foreground shadow-sm">
              {(staff.fullName || staff.email).slice(0, 2).toUpperCase()}
            </span>
            <ManagerStatusBadge
              status={staff.isActive ? 'active' : 'inactive'}
              label={staff.isActive ? 'Đang hoạt động' : 'Đã khóa'}
            />
          </div>
          <DialogTitle className="text-3xl font-black text-foreground">{staff.fullName}</DialogTitle>
          <DialogDescription>
            Hồ sơ tài khoản và các xe đang được nhân viên ghi nhận tại cổng.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <DetailItem label="Email" value={staff.email} />
          <DetailItem label="Số điện thoại" value={staff.phone || 'Chưa cập nhật'} />
          <DetailItem label="Vai trò" value="Nhân viên cổng bãi xe" />
          <DetailItem label="Ngày tạo tài khoản" value={formatDateTime(staff.createdAt)} />
          <DetailItem label="Cập nhật gần nhất" value={formatDateTime(staff.updatedAt)} />
          <DetailItem
            label="Xe đang phụ trách"
            value={`${staffSessions.length} xe · ${carCount} ô tô · ${motorcycleCount} xe máy`}
          />
        </div>

        <section className="border-t border-border bg-background/45 p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">
                Hoạt động hiện tại
              </p>
              <h3 className="mt-1 text-lg font-black text-foreground">Xe đang theo dõi</h3>
            </div>
            <span className="rounded-full border border-border bg-card px-3 py-1 text-xs font-bold text-foreground">
              {staffSessions.length} xe
            </span>
          </div>

          {staffSessions.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-border bg-card/60 p-6 text-center text-sm text-muted-foreground">
              Nhân viên chưa có xe nào đang phụ trách.
            </div>
          ) : (
            <div className="mt-4 grid gap-3">
              {staffSessions.map((session) => (
                <article
                  key={session._id}
                  className="grid gap-3 rounded-2xl border border-border bg-card p-4 sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Biển số xe</p>
                    <p className="mt-1 font-black tracking-[0.06em] text-foreground">{session.licensePlate}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Phân loại</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {vehicleLabels[session.vehicleType]} · {customerLabels[session.customerType]}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Giờ vào</p>
                    <p className="mt-1 text-sm font-semibold text-foreground">
                      {formatDateTime(session.entryTime)}
                    </p>
                  </div>
                  <span className={getPaymentTone(session.paymentStatus)}>
                    {paymentLabels[session.paymentStatus]}
                  </span>
                </article>
              ))}
            </div>
          )}
        </section>
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 break-words font-semibold text-foreground">{value}</p>
    </div>
  )
}

function formatDateTime(value?: string) {
  if (!value) return 'Chưa có dữ liệu'
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

function getPaymentTone(status: GateSession['paymentStatus']) {
  const baseClass = 'inline-flex w-fit rounded-full border px-3 py-1 text-xs font-bold'

  if (status === 'paid') {
    return `${baseClass} border-emerald-400/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-200`
  }
  if (status === 'pending') {
    return `${baseClass} border-amber-400/40 bg-amber-500/10 text-amber-700 dark:text-amber-200`
  }
  return `${baseClass} border-rose-400/40 bg-rose-500/10 text-rose-700 dark:text-rose-200`
}
