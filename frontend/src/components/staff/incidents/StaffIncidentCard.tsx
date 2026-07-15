import type { Complaint, ComplaintStatus } from '../../../services/complaintsApi'
import { Button } from '../../ui/button'
import {
  formatIncidentDateTime,
  getComplaintSlotCode,
  getComplaintUserName,
  INCIDENT_STATUS_DOT,
  INCIDENT_STATUS_LABELS,
  INCIDENT_STATUS_TONE,
} from './staffIncidentUtils'
import { StaffIncidentDetailsDialog } from './StaffIncidentDetailsDialog'

type StaffIncidentCardProps = {
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

export function StaffIncidentCard({ complaint, isUpdating, onUpdateStatus }: StaffIncidentCardProps) {
  const occupiedSlot = getComplaintSlotCode(complaint)
  const correctSlot = complaint.offendingSlotCode || 'Chưa xác định'

  return (
    <article className="rounded-2xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted hover:shadow-lg">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-[repeat(5,minmax(0,1fr))_minmax(240px,1.2fr)] xl:items-stretch">
        <div className="flex min-h-20 min-w-0 flex-col justify-start rounded-xl bg-background/55 p-3">
          <p className="text-xs text-muted-foreground">Biển số đậu sai</p>
          <p className="mt-1 truncate text-lg font-black tracking-[0.06em] text-foreground">
            {complaint.offendingPlate}
          </p>
        </div>

        <div className="flex min-h-20 min-w-0 flex-col justify-start rounded-xl bg-background/55 p-3">
          <p className="text-xs text-muted-foreground">Trạng thái</p>
          <div className="mt-2">
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${INCIDENT_STATUS_TONE[complaint.status]}`}>
              <span className={`h-2 w-2 rounded-full ${INCIDENT_STATUS_DOT[complaint.status]}`} />
              {INCIDENT_STATUS_LABELS[complaint.status]}
            </span>
          </div>
        </div>

        <InfoCell label="Vị trí phản ánh" value={`Ô bị chiếm ${occupiedSlot}`} subValue={`Ô đúng ${correctSlot}`} />
        <InfoCell label="Cư dân báo cáo" value={getComplaintUserName(complaint.complainantUserId)} />
        <InfoCell label="Thời gian gửi" value={formatIncidentDateTime(complaint.createdAt)} />

        <div className="flex min-h-20 flex-col justify-center gap-2 rounded-xl bg-background/55 p-3">
          <StaffIncidentDetailsDialog
            complaint={complaint}
            trigger={
              <Button type="button" variant="outline" className="h-9 w-full rounded-xl font-semibold">
                Xem chi tiết
              </Button>
            }
          />

          {complaint.status !== 'resolved' && (
            <div className="grid grid-cols-2 gap-2">
              {complaint.status === 'open' && (
                <Button
                  type="button"
                  variant="secondary"
                  className="h-9 rounded-xl font-semibold"
                  disabled={isUpdating}
                  onClick={() => onUpdateStatus(complaint, 'in_progress')}
                >
                  {isUpdating ? 'Đang lưu...' : 'Nhận xử lý'}
                </Button>
              )}
              <Button
                type="button"
                className={[
                  'h-9 rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-500',
                  complaint.status === 'in_progress' ? 'col-span-2' : '',
                ].join(' ')}
                disabled={isUpdating}
                onClick={() => onUpdateStatus(complaint, 'resolved')}
              >
                {isUpdating ? 'Đang lưu...' : 'Đã xử lý'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
