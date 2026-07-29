import type { ReactNode } from 'react'
import type { Complaint } from '../../../services/complaintsApi'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../../ui/dialog'
import {
  formatIncidentDateTime,
  getComplaintSlotCode,
  getComplaintUserName,
  getComplaintUserPhone,
  INCIDENT_STATUS_DOT,
  INCIDENT_STATUS_LABELS,
  INCIDENT_STATUS_TONE,
} from './staffIncidentUtils'

type StaffIncidentDetailsDialogProps = {
  complaint: Complaint
  trigger: ReactNode
}

export function StaffIncidentDetailsDialog({
  complaint,
  trigger,
}: StaffIncidentDetailsDialogProps) {
  const occupiedSlot = getComplaintSlotCode(complaint)
  const correctSlot = complaint.offendingSlotCode || 'Chưa xác định'
  const offenderPhone = complaint.offendingPhone || getComplaintUserPhone(complaint.offendingUserId)

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border bg-linear-to-br from-rose-500/10 via-transparent to-sky-500/10 p-6 pr-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">Biển số đậu sai</span>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${INCIDENT_STATUS_TONE[complaint.status]}`}>
              <span className={`h-2 w-2 rounded-full ${INCIDENT_STATUS_DOT[complaint.status]}`} />
              {INCIDENT_STATUS_LABELS[complaint.status]}
            </span>
          </div>
          <DialogTitle className="text-3xl font-black tracking-[0.08em] text-foreground">
            {complaint.offendingPlate}
          </DialogTitle>
          <DialogDescription>Kiểm tra vị trí, liên hệ chủ xe và cập nhật tiến độ xử lý.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <SlotItem label="Ô bị chiếm" value={occupiedSlot} tone="rose" />
          <SlotItem label="Ô đúng của xe" value={correctSlot} tone="emerald" />
          <DetailItem label="Cư dân báo cáo" value={getComplaintUserName(complaint.complainantUserId)} />
          <DetailItem label="Chủ xe đậu sai" value={getComplaintUserName(complaint.offendingUserId)} />
          <DetailItem label="Số điện thoại cần gọi" value={offenderPhone || 'Không có trong hệ thống'} />
          <DetailItem label="Email đã cảnh báo" value={complaint.alertSentTo || 'Chưa gửi hoặc không có email'} />
          <DetailItem label="Thời gian gửi" value={formatIncidentDateTime(complaint.createdAt)} />
          <DetailItem label="Thời gian xử lý xong" value={complaint.resolvedAt ? formatIncidentDateTime(complaint.resolvedAt) : '-'} />
          {complaint.description && <DetailItem label="Ghi chú cư dân" value={complaint.description} wide />}
          {complaint.resolutionNote && <DetailItem label="Ghi chú xử lý" value={complaint.resolutionNote} wide />}
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

function SlotItem({ label, value, tone }: { label: string; value: string; tone: 'rose' | 'emerald' }) {
  const toneClass = tone === 'rose'
    ? 'border-rose-400/30 bg-rose-500/10'
    : 'border-emerald-400/30 bg-emerald-500/10'

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-xl font-black text-foreground">{value}</p>
    </div>
  )
}
