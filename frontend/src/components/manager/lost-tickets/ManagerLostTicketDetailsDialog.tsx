import type { ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { ManagerIncident } from '../../../services/managerIncidentsApi'
import {
  formatLostTicketCurrency,
  formatLostTicketDateTime,
  getIncidentSession,
  getIncidentStaffName,
  getIncidentVehicleType,
  getLostTicketStatus,
  LOST_TICKET_STATUS_LABELS,
  LOST_TICKET_STATUS_TONES,
  LOST_TICKET_VEHICLE_LABELS,
} from './managerLostTicketUi'

type ManagerLostTicketDetailsDialogProps = {
  incident: ManagerIncident
  trigger: ReactNode
}

export function ManagerLostTicketDetailsDialog({ incident, trigger }: ManagerLostTicketDetailsDialogProps) {
  const session = getIncidentSession(incident)
  const vehicleType = getIncidentVehicleType(incident)
  const status = getLostTicketStatus(incident)
  const totalSessionFee = session?.fee ?? incident.fineAmount ?? 0
  const lostTicketFine = incident.fineAmount || 0
  const parkingFee = Math.max(totalSessionFee - lostTicketFine, 0)

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border bg-linear-to-br from-amber-500/10 via-transparent to-sky-500/10 p-6 pr-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-200">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Mất vé
            </span>
            <span className="text-xs font-semibold text-muted-foreground">
              {vehicleType ? LOST_TICKET_VEHICLE_LABELS[vehicleType] : 'Không rõ loại xe'}
            </span>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${LOST_TICKET_STATUS_TONES[status]}`}>
              <span className="h-2 w-2 rounded-full bg-current" aria-hidden="true" />
              {LOST_TICKET_STATUS_LABELS[status]}
            </span>
          </div>
          <DialogTitle className="text-3xl font-black tracking-[0.08em] text-foreground">
            {incident.licensePlate}
          </DialogTitle>
          <DialogDescription>Thông tin xử lý và chi tiết khoản thanh toán của phiên gửi xe.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <DetailItem label="Nhân viên xử lý" value={getIncidentStaffName(incident.staffId)} />
          <DetailItem label="Thời gian ghi nhận" value={formatLostTicketDateTime(incident.createdAt)} />
          <DetailItem label="Giờ vào" value={formatLostTicketDateTime(session?.entryTime)} />
          <DetailItem label="Giờ ra" value={formatLostTicketDateTime(session?.exitTime)} />
          {session?._id && <DetailItem label="Mã phiên" value={session._id} wide />}
          {incident.description && <DetailItem label="Ghi chú xử lý" value={incident.description} wide />}
        </div>

        <div className="border-t border-border bg-background/45 p-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">Chi tiết thanh toán</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <FeeItem label="Phí gửi xe" value={parkingFee} />
            <FeeItem label="Phí phạt mất vé" value={lostTicketFine} tone="amber" />
            <FeeItem label="Tổng thanh toán" value={totalSessionFee} tone="sky" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function DetailItem({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={['rounded-2xl border border-border bg-card p-4', wide ? 'sm:col-span-2' : ''].join(' ')}>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 wrap-break-word font-semibold text-foreground">{value}</p>
    </div>
  )
}

function FeeItem({ label, value, tone = 'default' }: { label: string; value: number; tone?: 'default' | 'amber' | 'sky' }) {
  const toneClass = {
    default: 'border-border bg-card',
    amber: 'border-amber-400/40 bg-amber-500/10',
    sky: 'border-sky-400/40 bg-sky-500/10',
  }[tone]

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-lg font-black text-foreground">{formatLostTicketCurrency(value)}</p>
    </div>
  )
}
