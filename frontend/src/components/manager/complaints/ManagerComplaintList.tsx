import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import type {
  Complaint,
  ComplaintStatus,
} from '../../../services/complaintsApi'
import { ManagerTableShell } from '../common/ManagerTableShell'
import { ManagerComplaintDetailsDialog } from './ManagerComplaintDetailsDialog'
import {
  formatManagerComplaintDateTime,
  getComplaintSlotCode,
  getComplaintUserName,
  MANAGER_COMPLAINT_STATUS_DOT,
  MANAGER_COMPLAINT_STATUS_LABELS,
  MANAGER_COMPLAINT_STATUS_TONE,
} from './managerComplaintUi'

type Props = {
  complaints: Complaint[]
  isLoading: boolean
  updatingId: string
  onUpdateStatus: (complaint: Complaint, status: ComplaintStatus) => void
}
export function ManagerComplaintList({
  complaints,
  isLoading,
  updatingId,
  onUpdateStatus,
}: Props) {
  if (isLoading)
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm font-semibold text-muted-foreground">
        Đang tải danh sách khiếu nại...
      </div>
    )
  if (!complaints.length)
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
        <h2 className="text-xl font-black text-foreground">
          Chưa có khiếu nại phù hợp
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Khiếu nại xe đậu sai chỗ sẽ xuất hiện tại đây.
        </p>
      </div>
    )
  return (
    <ManagerTableShell
      eyebrow="Phản ánh cư dân"
      title="Danh sách khiếu nại"
      countLabel={`${complaints.length} khiếu nại`}
      minWidth="1120px"
      columns={[
        { label: 'Biển số đậu sai', className: 'w-[17%]' },
        { label: 'Trạng thái', className: 'w-[16%]' },
        { label: 'Vị trí phản ánh', className: 'w-[21%]' },
        { label: 'Cư dân báo cáo', className: 'w-[20%]' },
        { label: 'Thời gian gửi', className: 'w-[15%]' },
        { label: 'Thao tác', className: 'w-[11%] text-right' },
      ]}
    >
      {complaints.map((complaint) => (
        <TableRow key={complaint._id}>
          <TableCell className="px-4 py-4 font-black tracking-[0.06em] text-foreground">
            {complaint.offendingPlate}
          </TableCell>
          <TableCell className="px-4 py-4">
            <span
              className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${MANAGER_COMPLAINT_STATUS_TONE[complaint.status]}`}
            >
              <span
                className={`h-2 w-2 rounded-full ${MANAGER_COMPLAINT_STATUS_DOT[complaint.status]}`}
              />
              {MANAGER_COMPLAINT_STATUS_LABELS[complaint.status]}
            </span>
          </TableCell>
          <TableCell className="px-4 py-4">
            <p className="font-semibold text-foreground">
              Ô bị chiếm {getComplaintSlotCode(complaint)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Ô đúng {complaint.offendingSlotCode || 'Chưa xác định'}
            </p>
          </TableCell>
          <TableCell className="px-4 py-4 font-semibold text-foreground">
            {getComplaintUserName(complaint.complainantUserId)}
          </TableCell>
          <TableCell className="px-4 py-4 text-foreground">
            {formatManagerComplaintDateTime(complaint.createdAt)}
          </TableCell>
          <TableCell className="px-4 py-4 text-right">
            <ManagerComplaintDetailsDialog
              complaint={complaint}
              isUpdating={updatingId === complaint._id}
              onUpdateStatus={onUpdateStatus}
              trigger={
                <Button type="button" variant="outline" size="sm">
                  Xem chi tiết
                </Button>
              }
            />
          </TableCell>
        </TableRow>
      ))}
    </ManagerTableShell>
  )
}
