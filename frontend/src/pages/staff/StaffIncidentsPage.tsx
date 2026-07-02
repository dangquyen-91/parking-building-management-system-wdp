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
        description="Theo dõi các báo cáo cư dân gửi khi có xe khác chiếm ô đỗ. Staff có thể gọi chủ xe và cập nhật trạng thái xử lý."
        actions={
          <button
            type="button"
            onClick={() => void loadComplaints()}
            className="h-11 rounded-xl border border-theme bg-badge px-4 text-sm font-bold text-fg hover:bg-ghost"
          >
            Tải lại
          </button>
        }
      />

      <StaffIncidentStats stats={stats} />

      <StaffIncidentFilters statusFilter={statusFilter} onStatusFilterChange={setStatusFilter} />

      {isLoading ? (
        <div className="rounded-xl border border-theme bg-badge p-6 text-center text-sm text-muted">
          Đang tải danh sách khiếu nại...
        </div>
      ) : complaints.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-theme bg-badge p-10 text-center">
          <h2 className="text-lg font-bold text-fg">Chưa có khiếu nại phù hợp</h2>
          <p className="mt-2 text-sm text-muted">
            Khi cư dân báo xe đậu sai chỗ, danh sách sẽ xuất hiện ở đây.
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
