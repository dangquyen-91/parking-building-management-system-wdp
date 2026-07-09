import type { Complaint, ComplaintStatus } from '../../../services/complaintsApi'
import { ManagerComplaintCard } from './ManagerComplaintCard'

type ManagerComplaintListProps = {
  complaints: Complaint[]
  isLoading: boolean
  updatingId: string
  onUpdateStatus: (complaint: Complaint, status: ComplaintStatus) => void
}

export function ManagerComplaintList({ complaints, isLoading, updatingId, onUpdateStatus }: ManagerComplaintListProps) {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm font-semibold text-muted-foreground">
        Đang tải danh sách khiếu nại...
      </div>
    )
  }

  if (complaints.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
        <p className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border bg-background text-2xl font-black text-foreground">
          ✓
        </p>
        <h2 className="mt-4 text-xl font-black text-foreground">Chưa có khiếu nại phù hợp</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Khi cư dân báo xe đậu sai chỗ, thông tin biển số, ô bị chiếm và liên hệ chủ xe sẽ hiển thị tại đây.
        </p>
      </div>
    )
  }

  return (
    <section className="grid gap-4">
      {complaints.map((complaint) => (
        <ManagerComplaintCard
          key={complaint._id}
          complaint={complaint}
          isUpdating={updatingId === complaint._id}
          onUpdateStatus={onUpdateStatus}
        />
      ))}
    </section>
  )
}


