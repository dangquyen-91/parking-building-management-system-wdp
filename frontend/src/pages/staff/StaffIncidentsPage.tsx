import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  StaffGateToast,
  StaffIncidentCard,
  StaffIncidentFilters,
  StaffIncidentStats,
  StaffPageHeader,
} from '../../components/staff'
import { getComplaintResolutionNote, INCIDENT_STATUS_LABELS } from '../../components/staff/incidents/staffIncidentUtils'
import { Card, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Skeleton } from '../../components/ui/skeleton'
import { complaintsApi, type Complaint, type ComplaintStatus } from '../../services/complaintsApi'

function normalizePlate(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]/g, '')
}

export function StaffIncidentsPage() {
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const filteredComplaints = useMemo(() => {
    const normalizedQuery = normalizePlate(query)
    if (!normalizedQuery) return complaints
    return complaints.filter((item) => normalizePlate(item.offendingPlate).includes(normalizedQuery))
  }, [complaints, query])

  const stats = useMemo(
    () => ({
      open: filteredComplaints.filter((item) => item.status === 'open').length,
      inProgress: filteredComplaints.filter((item) => item.status === 'in_progress').length,
      resolved: filteredComplaints.filter((item) => item.status === 'resolved').length,
    }),
    [filteredComplaints],
  )

  const loadComplaints = useCallback(async () => {
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
  }, [statusFilter])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadComplaints(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [loadComplaints])

  useEffect(() => {
    if (!message) return undefined
    const timeoutId = window.setTimeout(() => setMessage(null), 6000)
    return () => window.clearTimeout(timeoutId)
  }, [message])

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
          <StaffIncidentFilters
            query={query}
            statusFilter={statusFilter}
            onQueryChange={setQuery}
            onStatusFilterChange={setStatusFilter}
          />
        }
      />

      <StaffIncidentStats stats={stats} />

      {isLoading ? (
        <Skeleton className="h-40 rounded-xl" />
      ) : filteredComplaints.length === 0 ? (
        <Card className="border-dashed">
          <CardHeader className="text-center">
            <CardTitle>Chưa có khiếu nại phù hợp</CardTitle>
            <CardDescription>
              Khi cư dân báo xe đậu sai chỗ, thông tin biển số, ô bị chiếm và số điện thoại liên hệ sẽ xuất hiện ở đây.
            </CardDescription>
          </CardHeader>
        </Card>
      ) : (
        <section className="grid gap-4">
          {filteredComplaints.map((complaint) => (
            <StaffIncidentCard
              key={complaint._id}
              complaint={complaint}
              isUpdating={updatingId === complaint._id}
              onUpdateStatus={handleUpdateStatus}
            />
          ))}
        </section>
      )}

      {message && <StaffGateToast message={message} onClose={() => setMessage(null)} />}
    </div>
  )
}
