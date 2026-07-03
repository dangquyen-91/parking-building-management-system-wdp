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
    <article className="liquid-glass-card overflow-hidden rounded-3xl border border-theme">
      <div className="grid gap-0 xl:grid-cols-[minmax(260px,0.9fr)_minmax(420px,1.25fr)_280px]">
        <section className="border-b border-theme bg-gradient-to-br from-rose-500/10 via-transparent to-sky-500/10 p-5 xl:border-b-0 xl:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-subtle">Biển số đậu sai</p>
              <h2 className="mt-2 text-3xl font-black tracking-[0.08em] text-fg">{complaint.offendingPlate}</h2>
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

          <p className="mt-4 text-xs font-semibold text-muted">Gửi lúc {formatManagerComplaintDateTime(complaint.createdAt)}</p>
        </section>

        <section className="grid gap-3 border-b border-theme p-5 md:grid-cols-2 xl:border-b-0 xl:border-r">
          <InfoCard label="Cư dân báo cáo" value={getComplaintUserName(complaint.complainantUserId)} />
          <InfoCard label="Chủ xe đậu sai" value={getComplaintUserName(complaint.offendingUserId)} />
          <InfoCard label="Số điện thoại cần gọi" value={offenderPhone || 'Không có trong hệ thống'} important={!!offenderPhone} />
          <InfoCard label="Email đã cảnh báo" value={complaint.alertSentTo || 'Chưa gửi / không có email'} />
          {complaint.description && <InfoCard label="Ghi chú cư dân" value={complaint.description} wide />}
          {complaint.resolutionNote && <InfoCard label="Ghi chú xử lý" value={complaint.resolutionNote} wide />}
        </section>

        <section className="flex flex-col justify-between gap-4 bg-page/35 p-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-subtle">Điều phối</p>
            <div className="mt-3 space-y-3 text-sm text-muted">
              <Step active={complaint.status === 'open'} text="Tiếp nhận khiếu nại mới từ cư dân." />
              <Step active={complaint.status === 'in_progress'} text="Gọi chủ xe đậu sai để yêu cầu di chuyển." />
              <Step active={complaint.status === 'resolved'} text="Đóng khiếu nại sau khi vị trí đã được giải quyết." />
            </div>
          </div>

          <div className="grid gap-2">
            {complaint.status === 'open' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(complaint, 'in_progress')}
                disabled={isUpdating}
                className="h-11 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-sky-500 disabled:opacity-60"
              >
                {isUpdating ? 'Đang lưu...' : 'Nhận xử lý'}
              </button>
            )}
            {complaint.status !== 'resolved' && (
              <button
                type="button"
                onClick={() => onUpdateStatus(complaint, 'resolved')}
                disabled={isUpdating}
                className="h-11 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-500 disabled:opacity-60"
              >
                {isUpdating ? 'Đang lưu...' : 'Đánh dấu đã xử lý'}
              </button>
            )}
            {complaint.status === 'resolved' && (
              <div className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm font-semibold text-emerald-700 dark:text-emerald-100">
                Khiếu nại này đã được đóng.
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
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-subtle">{label}</p>
      <p className="mt-1 text-lg font-black text-fg">{value}</p>
    </div>
  )
}

function InfoCard({ label, value, important, wide }: { label: string; value: string; important?: boolean; wide?: boolean }) {
  return (
    <div className={['rounded-2xl border border-theme bg-badge p-4', wide ? 'md:col-span-2' : ''].join(' ')}>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-subtle">{label}</p>
      <p className={['mt-1 break-words text-sm font-bold', important ? 'text-sky-600 dark:text-sky-200' : 'text-fg'].join(' ')}>
        {value}
      </p>
    </div>
  )
}

function Step({ text, active }: { text: string; active: boolean }) {
  return (
    <p className="flex gap-3">
      <span className={['mt-1 h-2.5 w-2.5 shrink-0 rounded-full', active ? 'bg-sky-500' : 'bg-border-strong'].join(' ')} />
      <span>{text}</span>
    </p>
  )
}
