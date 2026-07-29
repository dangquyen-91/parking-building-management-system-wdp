import type {
  Complaint,
  ComplaintStatus,
} from '../../../services/complaintsApi'
import { Button } from '../../ui/button'
import { TableCell, TableRow } from '../../ui/table'
import { StaffTableShell } from '../common/StaffTableShell'
import { StaffIncidentDetailsDialog } from './StaffIncidentDetailsDialog'
import {
  formatIncidentDateTime,
  getComplaintSlotCode,
  getComplaintUserName,
  INCIDENT_STATUS_DOT,
  INCIDENT_STATUS_LABELS,
  INCIDENT_STATUS_TONE,
} from './staffIncidentUtils'

type Props = {
  complaints: Complaint[]
  updatingId: string
  onUpdateStatus: (complaint: Complaint, status: ComplaintStatus) => void
}

export function StaffIncidentList({
  complaints,
  updatingId,
  onUpdateStatus,
}: Props) {
  return (
    <StaffTableShell
      eyebrow="Theo dõi xử lý"
      title="Danh sách sự cố"
      countLabel={`${complaints.length} sự cố`}
      minWidth="1120px"
      columns={[
        { label: 'Biển số đậu sai', className: 'w-[16%]' },
        { label: 'Trạng thái', className: 'w-[15%]' },
        { label: 'Vị trí phản ánh', className: 'w-[20%]' },
        { label: 'Cư dân báo cáo', className: 'w-[18%]' },
        { label: 'Thời gian gửi', className: 'w-[15%]' },
        { label: 'Thao tác', className: 'w-[16%] text-right' },
      ]}
    >
      {complaints.map((complaint) => {
        const isUpdating = updatingId === complaint._id
        return (
          <TableRow key={complaint._id}>
            <TableCell className="px-4 py-4 font-black tracking-[0.06em] text-foreground">
              {complaint.offendingPlate}
            </TableCell>
            <TableCell className="px-4 py-4">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-bold ${INCIDENT_STATUS_TONE[complaint.status]}`}
              >
                <span
                  className={`h-2 w-2 rounded-full ${INCIDENT_STATUS_DOT[complaint.status]}`}
                />
                {INCIDENT_STATUS_LABELS[complaint.status]}
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
              {formatIncidentDateTime(complaint.createdAt)}
            </TableCell>
            <TableCell className="px-4 py-4">
              <div className="flex justify-end gap-2">
                <StaffIncidentDetailsDialog
                  complaint={complaint}
                  trigger={
                    <Button type="button" variant="outline" size="sm">
                      Chi tiết
                    </Button>
                  }
                />
                {complaint.status === 'open' && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    disabled={isUpdating}
                    onClick={() => onUpdateStatus(complaint, 'in_progress')}
                  >
                    Nhận xử lý
                  </Button>
                )}
                {complaint.status === 'in_progress' && (
                  <Button
                    type="button"
                    size="sm"
                    className="bg-emerald-600 text-white hover:bg-emerald-500"
                    disabled={isUpdating}
                    onClick={() => onUpdateStatus(complaint, 'resolved')}
                  >
                    Đã xử lý
                  </Button>
                )}
              </div>
            </TableCell>
          </TableRow>
        )
      })}
    </StaffTableShell>
  )
}
