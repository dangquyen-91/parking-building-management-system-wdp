import { useEffect, useMemo, useState } from 'react'
import {
  StaffGateToast,
  StaffIncidentCard,
  StaffIncidentFilters,
  StaffIncidentStats,
  StaffPageHeader,
} from '../../components/staff'
import { complaintsApi, type Complaint, type ComplaintStatus } from '../../services/complaintsApi'
import { getComplaintResolutionNote, INCIDENT_STATUS_LABELS } from '../../components/staff/incidents/staffIncidentUtils'

export function StaffIncidentsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const stats = useMemo(
    () => ({
      open: complaints.filter((item) => item.status === 'open').length,
      inProgress: complaints.filter((item) => item.status === 'in_progress').length,
      resolved: complaints.filter((item) => item.status === 'resolved').length,
    }),
    [complaints],
  )

  useEffect(() => {
    void loadComplaints()
  }, [statusFilter])

  useEffect(() => {
    if (!message) return
    setToastMessage(message)
    const timeoutId = window.setTimeout(() => setToastMessage(null), 6000)
    return () => window.clearTimeout(timeoutId)
  }, [message])

  async function loadComplaints() {
    setIsLoading(true)
    setMessage(null)

    try {
      const response = await complaintsApi.getAll({
        limit: 100,
        status: statusFilter === 'all' ? undefined : statusFilter,
      })
      setComplaints(response.complaints ?? [])
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không tải được danh sách khiếu nại.')
    } finally {
      setIsLoading(false)
    }
  }

  async function handleUpdateStatus(complaint: Complaint, status: ComplaintStatus) {
    setUpdatingId(complaint._id)
    setMessage(null)

    try {
      const response = await complaintsApi.updateStatus(complaint._id, {
        status,
        resolutionNote: getComplaintResolutionNote(status),
      })
      setComplaints((current) =>
        current.map((item) => (item._id === response.complaint._id ? response.complaint : item)),
      )
      setMessage(`Đã cập nhật khiếu nại ${complaint.offendingPlate} sang "${INCIDENT_STATUS_LABELS[status]}".`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không cập nhật được trạng thái khiếu nại.')
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-8 lg:p-10">
      <StaffPageHeader
        eyebrow="Sự cố & khiếu nại"
        title="Khiếu nại đậu sai chỗ"
        description="Theo dõi xe đậu sai ô, gọi đúng chủ xe và cập nhật trạng thái xử lý trong ca trực."
        actions={
          <button
            type="button"
            onClick={() => void loadComplaints()}
            className="h-11 rounded-xl border border-theme bg-badge px-4 text-sm font-bold text-fg transition hover:bg-ghost"
          >
            Tải lại
          </button>
        }
      />

      <StaffIncidentStats stats={stats} />

      <StaffIncidentFilters statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />

      {isLoading ? (
        <div className="rounded-3xl border border-theme bg-badge p-8 text-center text-sm font-semibold text-muted">
          Đang tải danh sách khiếu nại...
        </div>
      ) : complaints.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-theme bg-badge p-12 text-center">
          <p className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-theme bg-page text-2xl font-black text-fg">
            ✓
          </p>
          <h2 className="mt-4 text-xl font-black text-fg">Chưa có khiếu nại phù hợp</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-muted">
            Khi cư dân báo xe đậu sai chỗ, thông tin biển số, ô bị chiếm và số điện thoại liên hệ sẽ xuất hiện ở đây.
          </p>
        </div>
      ) : (
        <section className="grid gap-4">
          {complaints.map((complaint) => (
            <StaffIncidentCard
              key={complaint._id}
              complaint={complaint}
              isUpdating={updatingId === complaint._id}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </section>
      )}

      {toastMessage && <StaffGateToast message={toastMessage} onClose={() => setToastMessage(null)} />}
    </div>
  )
}
