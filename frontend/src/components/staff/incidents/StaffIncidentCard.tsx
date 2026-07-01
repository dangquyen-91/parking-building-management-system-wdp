import type { Complaint, ComplaintStatus } from '../../../services/complaintsApi'
import {
  formatIncidentDateTime,
  getComplaintSlotCode,
  getComplaintUserName,
  getComplaintUserPhone,
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

  return (
    <article className="liquid-glass-card overflow-hidden rounded-2xl">
      <div className="grid gap-4 p-5 lg:grid-cols-[1.1fr_1fr_auto] lg:items-center">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-subtle">
            {formatIncidentDateTime(complaint.createdAt)}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[0.08em] text-fg">{complaint.offendingPlate}</h2>
          <p className="mt-1 text-sm text-muted">
            Đang chiếm ô <b className="text-fg">{getComplaintSlotCode(complaint)}</b>
            {complaint.offendingSlotCode ? ` · Ô đúng: ${complaint.offendingSlotCode}` : ''}
          </p>
        </div>

        <div className="grid gap-2 rounded-xl border border-theme bg-badge p-4 text-sm">
          <Info label="Cư dân báo cáo" value={getComplaintUserName(complaint.complainantUserId)} />
          <Info label="Chủ xe đậu sai" value={getComplaintUserName(complaint.offendingUserId)} />
          <Info label="Số điện thoại" value={offenderPhone || 'Không có trong hệ thống'} />
          {complaint.description && <Info label="Ghi chú" value={complaint.description} />}
        </div>

        <div className="grid gap-3">
          <span className={`w-fit rounded-full border px-3 py-1 text-xs font-bold ${INCIDENT_STATUS_TONE[complaint.status]}`}>
            {INCIDENT_STATUS_LABELS[complaint.status]}
          </span>
          {complaint.status === 'open' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(complaint, 'in_progress')}
              disabled={isUpdating}
              className="h-11 rounded-xl bg-sky-600 px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {isUpdating ? 'Đang lưu...' : 'Nhận xử lý'}
            </button>
          )}
          {complaint.status !== 'resolved' && (
            <button
              type="button"
              onClick={() => onUpdateStatus(complaint, 'resolved')}
              disabled={isUpdating}
              className="h-11 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white disabled:opacity-60"
            >
              {isUpdating ? 'Đang lưu...' : 'Đã xử lý'}
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle">{label}</p>
      <p className="mt-1 font-semibold text-fg">{value}</p>
    </div>
  )
}
