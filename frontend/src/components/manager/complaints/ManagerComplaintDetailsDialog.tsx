import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import type { Complaint, ComplaintStatus } from '../../../services/complaintsApi'
import {
  formatManagerComplaintDateTime,
  getComplaintSlotCode,
  getComplaintUserName,
  getComplaintUserPhone,
  MANAGER_COMPLAINT_STATUS_DOT,
  MANAGER_COMPLAINT_STATUS_LABELS,
  MANAGER_COMPLAINT_STATUS_TONE,
} from './managerComplaintUi'

type ManagerComplaintDetailsDialogProps = {
  complaint: Complaint
  isUpdating: boolean
  onUpdateStatus: (complaint: Complaint, status: ComplaintStatus) => void
  trigger: ReactNode
}

export function ManagerComplaintDetailsDialog({
  complaint,
  isUpdating,
  onUpdateStatus,
  trigger,
}: ManagerComplaintDetailsDialogProps) {
  const occupiedSlot = getComplaintSlotCode(complaint)
  const correctSlot = complaint.offendingSlotCode || 'Chưa xác định'
  const offenderPhone = complaint.offendingPhone || getComplaintUserPhone(complaint.offendingUserId)

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-3xl">
        <DialogHeader className="border-b border-border bg-gradient-to-br from-rose-500/10 via-transparent to-sky-500/10 p-6 pr-12">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">Biển số đậu sai</span>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${MANAGER_COMPLAINT_STATUS_TONE[complaint.status]}`}>
              <span className={`h-2 w-2 rounded-full ${MANAGER_COMPLAINT_STATUS_DOT[complaint.status]}`} />
              {MANAGER_COMPLAINT_STATUS_LABELS[complaint.status]}
            </span>
          </div>
          <DialogTitle className="text-3xl font-black tracking-[0.08em] text-foreground">
            {complaint.offendingPlate}
          </DialogTitle>
          <DialogDescription>Thông tin phản ánh, liên hệ chủ xe và tiến độ xử lý khiếu nại.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <SlotItem label="Ô bị chiếm" value={occupiedSlot} tone="rose" />
          <SlotItem label="Ô đúng của xe" value={correctSlot} tone="emerald" />
          <DetailItem label="Cư dân báo cáo" value={getComplaintUserName(complaint.complainantUserId)} />
          <DetailItem label="Chủ xe đậu sai" value={getComplaintUserName(complaint.offendingUserId)} />
          <DetailItem label="Số điện thoại cần gọi" value={offenderPhone || 'Không có trong hệ thống'} />
          <DetailItem label="Email đã cảnh báo" value={complaint.alertSentTo || 'Chưa gửi hoặc không có email'} />
          <DetailItem label="Thời gian gửi" value={formatManagerComplaintDateTime(complaint.createdAt)} />
          <DetailItem label="Thời gian xử lý xong" value={formatManagerComplaintDateTime(complaint.resolvedAt)} />
          {complaint.description && <DetailItem label="Ghi chú cư dân" value={complaint.description} wide />}
          {complaint.resolutionNote && <DetailItem label="Ghi chú xử lý" value={complaint.resolutionNote} wide />}
        </div>

        <div className="border-t border-border bg-background/45 p-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted-foreground">Thao tác xử lý</p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
            {complaint.status === 'open' && (
              <Button
                type="button"
                onClick={() => onUpdateStatus(complaint, 'in_progress')}
                disabled={isUpdating}
                className="h-10 rounded-xl bg-sky-600 px-5 font-bold text-white hover:bg-sky-500"
              >
                {isUpdating ? 'Đang lưu...' : 'Nhận xử lý'}
              </Button>
            )}
            {complaint.status !== 'resolved' && (
              <Button
                type="button"
                onClick={() => onUpdateStatus(complaint, 'resolved')}
                disabled={isUpdating}
                className="h-10 rounded-xl bg-emerald-600 px-5 font-bold text-white hover:bg-emerald-500"
              >
                {isUpdating ? 'Đang lưu...' : 'Đánh dấu đã xử lý'}
              </Button>
            )}
            {complaint.status === 'resolved' && (
              <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-700 dark:text-emerald-200">
                Khiếu nại đã được xử lý.
              </p>
            )}
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
      <p className="mt-2 break-words font-semibold text-foreground">{value}</p>
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
