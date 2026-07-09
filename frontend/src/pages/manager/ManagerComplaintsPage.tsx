import { useEffect, useMemo, useState } from 'react'
import {
  ManagerComplaintFilters,
  ManagerComplaintList,
  ManagerComplaintStats,
  ManagerPageHeader,
  type ManagerComplaintStatusFilter,
} from '../../components/manager'
import { complaintsApi, type Complaint, type ComplaintStatus } from '../../services/complaintsApi'
import {
  getManagerComplaintResolutionNote,
  MANAGER_COMPLAINT_STATUS_LABELS,
  normalizeComplaintPlate,
} from '../../components/manager/complaints/managerComplaintUi'

export function ManagerComplaintsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [statusFilter, setStatusFilter] = useState<ManagerComplaintStatusFilter>('all')
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const filteredComplaints = useMemo(() => {
    const normalizedQuery = normalizeComplaintPlate(query)
    if (!normalizedQuery) return complaints
    return complaints.filter((item) => normalizeComplaintPlate(item.offendingPlate).includes(normalizedQuery))
  }, [complaints, query])

  const stats = useMemo(
    () => ({
      total: filteredComplaints.length,
      open: filteredComplaints.filter((item) => item.status === 'open').length,
      inProgress: filteredComplaints.filter((item) => item.status === 'in_progress').length,
      resolved: filteredComplaints.filter((item) => item.status === 'resolved').length,
    }),
    [filteredComplaints],
  )

  useEffect(() => {
    void loadComplaints()
  }, [statusFilter])

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
        resolutionNote: getManagerComplaintResolutionNote(status),
      })
      setComplaints((current) =>
        current.map((item) => (item._id === response.complaint._id ? response.complaint : item)),
      )
      setMessage(`Đã cập nhật ${complaint.offendingPlate} sang "${MANAGER_COMPLAINT_STATUS_LABELS[status]}".`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Không cập nhật được trạng thái khiếu nại.')
    } finally {
      setUpdatingId('')
    }
  }

  return (
    <div className="mx-auto max-w-[1500px] p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Quản lý // Khiếu nại"
        title="Khiếu nại đậu sai chỗ"
        description="Theo dõi phản ánh của cư dân, xem xe đang chiếm ô, liên hệ chủ xe và cập nhật tiến độ xử lý."
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

      {message && (
        <div className="mb-5 rounded-2xl border border-sky-400/40 bg-sky-500/10 px-4 py-3 text-sm font-semibold text-sky-700 dark:text-sky-100">
          {message}
        </div>
      )}

      <ManagerComplaintStats stats={stats} />

      <ManagerComplaintFilters
        query={query}
        statusFilter={statusFilter}
        onQueryChange={setQuery}
        onStatusFilterChange={setStatusFilter}
      />

      <ManagerComplaintList
        complaints={filteredComplaints}
        isLoading={isLoading}
        updatingId={updatingId}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  )
}
