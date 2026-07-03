import type { Complaint, ComplaintStatus } from '../../../services/complaintsApi'
import {
  formatIncidentDateTime,
  getComplaintSlotCode,
  getComplaintUserName,
  getComplaintUserPhone,
  INCIDENT_STATUS_DOT,
  INCIDENT_STATUS_LABELS,
  INCIDENT_STATUS_TONE,
} from './staffIncidentUtils'

type StaffIncidentCardProps = {
  complaint: Complaint
  isUpdating: boolean
  onUpdateStatus: (complaint: Complaint, status: ComplaintStatus) => void
}

export function StaffIncidentCard({
  complaint,
  isUpdating,
  onUpdateStatus,
}: StaffIncidentCardProps) {
  const offenderPhone = complaint.offendingPhone || getComplaintUserPhone(complaint.offendingUserId)
  const occupiedSlot = getComplaintSlotCode(complaint)
  const correctSlot = complaint.offendingSlotCode || 'Chưa xác định'

  return (
    <article className="liquid-glass-card group overflow-hidden rounded-3xl border border-theme">
      <div className="grid gap-0 xl:grid-cols-[minmax(280px,0.9fr)_minmax(360px,1.2fr)_260px]">
        <section className="border-b border-theme p-5 xl:border-b-0 xl:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-subtle">Biển số đậu sai</p>
              <h2 className="mt-2 text-3xl font-black tracking-[0.08em] text-fg">{complaint.offendingPlate}</h2>
            </div>
            <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${INCIDENT_STATUS_TONE[complaint.status]}`}>
              <span className={`h-2 w-2 rounded-full ${INCIDENT_STATUS_DOT[complaint.status]}`} />
              {INCIDENT_STATUS_LABELS[complaint.status]}
            </span>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <SlotBox label="Ô bị chiếm" value={occupiedSlot} tone="rose" />
            <SlotBox label="Ô đúng" value={correctSlot} tone="emerald" />
          </div>

          <p className="mt-4 text-xs font-semibold text-muted">Gửi lúc {formatIncidentDateTime(complaint.createdAt)}</p>
        </section>

        <section className="grid gap-3 border-b border-theme p-5 xl:border-b-0 xl:border-r">
          <InfoCard label="Cư dân báo cáo" value={getComplaintUserName(complaint.complainantUserId)} />
          <InfoCard label="Chủ xe đậu sai" value={getComplaintUserName(complaint.offendingUserId)} />
          <InfoCard label="Số điện thoại cần gọi" value={offenderPhone || 'Không có trong hệ thống'} important={!!offenderPhone} />
          {complaint.description && <InfoCard label="Ghi chú của cư dân" value={complaint.description} />}
        </section>

        <section className="flex flex-col justify-between gap-4 bg-page/35 p-5">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-subtle">Thao tác</p>

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

function SlotBox({
  label,
  value,
  tone,
}: {
  label: string
  value: string
  tone: 'rose' | 'emerald'
}) {
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

function InfoCard({
  label,
  value,
  important,
}: {
  label: string
  value: string
  important?: boolean
}) {
  return (
    <div className="rounded-2xl border border-theme bg-badge p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-subtle">{label}</p>
      <p className={['mt-1 text-sm font-bold', important ? 'text-sky-600 dark:text-sky-200' : 'text-fg'].join(' ')}>
        {value}
      </p>
    </div>
  )
}
