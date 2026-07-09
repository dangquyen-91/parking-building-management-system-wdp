import { Button } from '@/components/ui/button'
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

type ManagerComplaintCardProps = {
  complaint: Complaint
  isUpdating: boolean
  onUpdateStatus: (complaint: Complaint, status: ComplaintStatus) => void
}

export function ManagerComplaintCard({ complaint, isUpdating, onUpdateStatus }: ManagerComplaintCardProps) {
  const occupiedSlot = getComplaintSlotCode(complaint)
  const correctSlot = complaint.offendingSlotCode || 'Chưa xác định'
  const offenderPhone = complaint.offendingPhone || getComplaintUserPhone(complaint.offendingUserId)

  return (
    <article className="bg-card text-card-foreground ring-1 ring-border overflow-hidden rounded-3xl border border-border">
      <div className="grid gap-0 xl:grid-cols-[minmax(260px,0.9fr)_minmax(420px,1.25fr)_280px]">
        <section className="border-b border-border bg-gradient-to-br from-rose-500/10 via-transparent to-sky-500/10 p-5 xl:border-b-0 xl:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Biển số đậu sai</p>
              <h2 className="mt-2 text-3xl font-black tracking-[0.08em] text-foreground">{complaint.offendingPlate}</h2>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${MANAGER_COMPLAINT_STATUS_TONE[complaint.status]}`}>
              <span className={`h-2 w-2 rounded-full ${MANAGER_COMPLAINT_STATUS_DOT[complaint.status]}`} />
              {MANAGER_COMPLAINT_STATUS_LABELS[complaint.status]}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <SlotBox label="Ô bị chiếm" value={occupiedSlot} tone="rose" />
            <SlotBox label="Ô đúng" value={correctSlot} tone="emerald" />
          </div>

          <p className="mt-4 text-xs font-semibold text-muted-foreground">Gửi lúc {formatManagerComplaintDateTime(complaint.createdAt)}</p>
        </section>

        <section className="grid gap-3 border-b border-border p-5 md:grid-cols-2 xl:border-b-0 xl:border-r">
          <InfoCard label="Cư dân báo cáo" value={getComplaintUserName(complaint.complainantUserId)} />
          <InfoCard label="Chủ xe đậu sai" value={getComplaintUserName(complaint.offendingUserId)} />
          <InfoCard label="Số điện thoại cần gọi" value={offenderPhone || 'Không có trong hệ thống'} important={!!offenderPhone} />
          <InfoCard label="Email đã cảnh báo" value={complaint.alertSentTo || 'Chưa gửi / không có email'} />
          {complaint.description && <InfoCard label="Ghi chú cư dân" value={complaint.description} wide />}
          {complaint.resolutionNote && <InfoCard label="Ghi chú xử lý" value={complaint.resolutionNote} wide />}
        </section>

        <section className="flex flex-col justify-between gap-4 bg-background/35 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Điều phối</p>
          </div>

          <div className="grid gap-2">
            {complaint.status === 'open' && (
              <Button
                type="button"
                onClick={() => onUpdateStatus(complaint, 'in_progress')}
                disabled={isUpdating}
                className="h-11 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-500 disabled:opacity-60"
              >
                {isUpdating ? 'Đang lưu...' : 'Nhận xử lý'}
              </Button>
            )}
            {complaint.status !== 'resolved' && (
              <Button
                type="button"
                onClick={() => onUpdateStatus(complaint, 'resolved')}
                disabled={isUpdating}
                className="h-11 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
              >
                {isUpdating ? 'Đang lưu...' : 'Đánh dấu đã xử lý'}
              </Button>
            )}
            {complaint.status === 'resolved' && (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-700 dark:text-emerald-100">
                Khiếu nại này đã được thực hiện.
              </div>
            )}
          </div>
        </section>
      </div>
    </article>
  )
}

function SlotBox({ label, value, tone }: { label: string; value: string; tone: 'rose' | 'emerald' }) {
  const toneClass =
    tone === 'rose'
      ? 'border-rose-400/30 bg-rose-500/10'
      : 'border-emerald-400/30 bg-emerald-500/10'

  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-black text-foreground">{value}</p>
    </div>
  )
}

function InfoCard({ label, value, important, wide }: { label: string; value: string; important?: boolean; wide?: boolean }) {
  return (
    <div className={['rounded-2xl border border-border bg-card p-4', wide ? 'md:col-span-2' : ''].join(' ')}>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={['mt-1 break-words text-sm font-bold', important ? 'text-sky-600 dark:text-sky-200' : 'text-foreground'].join(' ')}>
        {value}
      </p>
    </div>
  )
}




