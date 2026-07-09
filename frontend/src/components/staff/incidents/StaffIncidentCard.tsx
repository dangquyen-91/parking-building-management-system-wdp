import type { Complaint, ComplaintStatus } from '../../../services/complaintsApi'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import {
  formatIncidentDateTime,
  getComplaintSlotCode,
  getComplaintUserName,
  getComplaintUserPhone,
  INCIDENT_STATUS_LABELS,
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
    <Card>
      <div className="grid gap-0 xl:grid-cols-[minmax(280px,0.9fr)_minmax(360px,1.2fr)_260px]">
        <CardHeader className="border-b xl:border-b-0 xl:border-r">
          <div className="flex items-start justify-between gap-4">
            <div>
              <CardDescription>Biển số đậu sai</CardDescription>
              <CardTitle className="mt-2 text-3xl tracking-[0.08em]">{complaint.offendingPlate}</CardTitle>
            </div>
            <Badge variant={complaint.status === 'resolved' ? 'secondary' : 'default'}>
              {INCIDENT_STATUS_LABELS[complaint.status]}
            </Badge>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <InfoCard label="Ô bị chiếm" value={occupiedSlot} />
            <InfoCard label="Ô đúng" value={correctSlot} />
          </div>
          <p className="mt-4 text-xs text-muted-foreground">Gửi lúc {formatIncidentDateTime(complaint.createdAt)}</p>
        </CardHeader>

        <CardContent className="grid gap-3 border-b p-5 xl:border-b-0 xl:border-r">
          <InfoCard label="Cư dân báo cáo" value={getComplaintUserName(complaint.complainantUserId)} />
          <InfoCard label="Chủ xe đậu sai" value={getComplaintUserName(complaint.offendingUserId)} />
          <InfoCard label="Số điện thoại cần gọi" value={offenderPhone || 'Không có trong hệ thống'} important={!!offenderPhone} />
          {complaint.description && <InfoCard label="Ghi chú của cư dân" value={complaint.description} />}
        </CardContent>

        <CardContent className="flex flex-col justify-between gap-4 p-5">
          <CardDescription>Thao tác</CardDescription>
          <div className="grid gap-2">
            {complaint.status === 'open' && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => onUpdateStatus(complaint, 'in_progress')}
                disabled={isUpdating}
              >
                {isUpdating ? 'Đang lưu...' : 'Nhận xử lý'}
              </Button>
            )}
            {complaint.status !== 'resolved' && (
              <Button
                type="button"
                onClick={() => onUpdateStatus(complaint, 'resolved')}
                disabled={isUpdating}
              >
                {isUpdating ? 'Đang lưu...' : 'Đánh dấu đã xử lý'}
              </Button>
            )}
            {complaint.status === 'resolved' && (
              <div className="rounded-lg border bg-muted/40 p-4 text-sm font-medium">
                Khiếu nại này đã được đóng.
              </div>
            )}
          </div>
        </CardContent>
      </div>
    </Card>
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
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={['mt-1 text-sm font-semibold', important ? 'text-primary' : ''].join(' ')}>
        {value}
      </p>
    </div>
  )
}
