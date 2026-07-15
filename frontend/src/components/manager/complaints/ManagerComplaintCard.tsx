import { Button } from '@/components/ui/button'
import type { Complaint, ComplaintStatus } from '../../../services/complaintsApi'
import {
  formatManagerComplaintDateTime,
  getComplaintSlotCode,
  getComplaintUserName,
  MANAGER_COMPLAINT_STATUS_DOT,
  MANAGER_COMPLAINT_STATUS_LABELS,
  MANAGER_COMPLAINT_STATUS_TONE,
} from './managerComplaintUi'
import { ManagerComplaintDetailsDialog } from './ManagerComplaintDetailsDialog'

type ManagerComplaintCardProps = {
  complaint: Complaint
  isUpdating: boolean
  onUpdateStatus: (complaint: Complaint, status: ComplaintStatus) => void
}

function InfoCell({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div className="flex min-h-20 min-w-0 flex-col justify-start rounded-xl bg-background/55 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-semibold text-foreground" title={value}>{value}</p>
      {subValue && <p className="mt-1 truncate text-xs text-muted-foreground" title={subValue}>{subValue}</p>}
    </div>
  )
}

export function ManagerComplaintCard({ complaint, isUpdating, onUpdateStatus }: ManagerComplaintCardProps) {
  const occupiedSlot = getComplaintSlotCode(complaint)
  const correctSlot = complaint.offendingSlotCode || 'Chưa xác định'

  return (
    <article className="rounded-2xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted hover:shadow-lg">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6 xl:items-stretch">
        <div className="flex min-h-20 min-w-0 flex-col justify-start rounded-xl bg-background/55 p-3">
          <p className="text-xs text-muted-foreground">Biển số đậu sai</p>
          <p className="mt-1 truncate text-lg font-black tracking-[0.06em] text-foreground">
            {complaint.offendingPlate}
          </p>
        </div>

        <div className="flex min-h-20 min-w-0 flex-col justify-start rounded-xl bg-background/55 p-3">
          <p className="text-xs text-muted-foreground">Trạng thái</p>
          <div className="mt-2">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${MANAGER_COMPLAINT_STATUS_TONE[complaint.status]}`}>
              <span className={`h-2 w-2 rounded-full ${MANAGER_COMPLAINT_STATUS_DOT[complaint.status]}`} />
              {MANAGER_COMPLAINT_STATUS_LABELS[complaint.status]}
            </span>
          </div>
        </div>

        <InfoCell label="Vị trí phản ánh" value={`Ô bị chiếm ${occupiedSlot}`} subValue={`Ô đúng ${correctSlot}`} />
        <InfoCell label="Cư dân báo cáo" value={getComplaintUserName(complaint.complainantUserId)} />
        <InfoCell label="Thời gian gửi" value={formatManagerComplaintDateTime(complaint.createdAt)} />

        <div className="flex min-h-20 items-center rounded-xl bg-background/55 p-3">
          <ManagerComplaintDetailsDialog
            complaint={complaint}
            isUpdating={isUpdating}
            onUpdateStatus={onUpdateStatus}
            trigger={
              <Button type="button" variant="outline" className="h-10 w-full rounded-xl font-semibold">
                Xem chi tiết
              </Button>
            }
          />
        </div>
      </div>
    </article>
  )
}
