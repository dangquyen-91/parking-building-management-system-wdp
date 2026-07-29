import type {
  GateSession,
  GateSessionStatus,
  GateUser,
} from '../../../services/staffGateApi'
import {
  formatSessionCustomer,
  formatSessionSpot,
  formatVehicleType,
} from '../../staff/data/staffGateUtils'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'
import { ManagerTableShell } from '../common/ManagerTableShell'
import { ManagerGateLogDetailsDialog } from './ManagerGateLogDetailsDialog'

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value))
}

function formatDuration(entryTime: string, exitTime?: string) {
  const end = exitTime ? new Date(exitTime).getTime() : Date.now()
  const minutes = Math.max(
    0,
    Math.floor((end - new Date(entryTime).getTime()) / 60_000),
  )
  const hours = Math.floor(minutes / 60)
  return hours > 0 ? `${hours} giờ ${minutes % 60} phút` : `${minutes} phút`
}

function getStaffName(staff?: GateUser | string | null) {
  if (!staff) return 'Không xác định'
  return typeof staff === 'string'
    ? staff
    : staff.fullName || staff.email || 'Không xác định'
}

const STATUS_BADGE: Record<
  GateSessionStatus,
  { status: 'active' | 'checkout' | 'cancelled'; label: string }
> = {
  active: { status: 'active', label: 'Đang trong bãi' },
  completed: { status: 'checkout', label: 'Đã ra' },
  cancelled: { status: 'cancelled', label: 'Đã hủy' },
}

type ManagerGateLogListProps = { sessions: GateSession[]; isLoading: boolean }

export function ManagerGateLogList({
  sessions,
  isLoading,
}: ManagerGateLogListProps) {
  if (isLoading)
    return (
      <div className="rounded-lg bg-card p-4 text-sm text-muted-foreground ring-1 ring-border">
        Đang tải hoạt động cổng...
      </div>
    )
  if (sessions.length === 0)
    return (
      <div className="rounded-lg bg-card p-4 text-sm text-muted-foreground ring-1 ring-border">
        Không có phiên gửi xe phù hợp.
      </div>
    )

  return (
    <ManagerTableShell
      eyebrow="Giám sát trực tiếp"
      title="Hoạt động cổng"
      countLabel={`${sessions.length} xe`}
      minWidth="1220px"
      columns={[
        { label: 'Biển số', className: 'w-[13%]' },
        { label: 'Phân loại', className: 'w-[14%]' },
        { label: 'Vị trí', className: 'w-[18%]' },
        { label: 'Nhân viên', className: 'w-[13%]' },
        { label: 'Thời gian', className: 'w-[18%]' },
        { label: 'Trạng thái', className: 'w-[14%]' },
        { label: 'Thao tác', className: 'w-[10%] text-right' },
      ]}
    >
      {sessions.map((session) => {
        const badge = STATUS_BADGE[session.status]
        return (
          <TableRow key={session._id}>
            <TableCell className="px-4 py-4">
              <p className="truncate font-black tracking-[0.06em] text-foreground">
                {session.licensePlate}
              </p>
              {session.note && (
                <p
                  className="mt-1 truncate text-xs text-muted-foreground"
                  title={session.note}
                >
                  {session.note}
                </p>
              )}
            </TableCell>
            <TableCell className="px-4 py-4">
              <p className="font-semibold text-foreground">
                {formatVehicleType(session.vehicleType)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatSessionCustomer(session)}
              </p>
            </TableCell>
            <TableCell className="px-4 py-4">
              <p
                className="line-clamp-2 whitespace-normal font-medium text-foreground"
                title={formatSessionSpot(session)}
              >
                {formatSessionSpot(session)}
              </p>
            </TableCell>
            <TableCell className="px-4 py-4 font-medium text-foreground">
              {getStaffName(session.staffId)}
            </TableCell>
            <TableCell className="px-4 py-4">
              <p className="font-medium text-foreground">
                Vào {formatDateTime(session.entryTime)}
              </p>
              {session.exitTime && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Ra {formatDateTime(session.exitTime)}
                </p>
              )}
            </TableCell>
            <TableCell className="px-4 py-4">
              <ManagerStatusBadge status={badge.status} label={badge.label} />
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDuration(session.entryTime, session.exitTime)}
              </p>
            </TableCell>
            <TableCell className="px-4 py-4 text-right">
              <ManagerGateLogDetailsDialog
                session={session}
                trigger={
                  <Button type="button" variant="outline" size="sm">
                    Xem chi tiết
                  </Button>
                }
              />
            </TableCell>
          </TableRow>
        )
      })}
    </ManagerTableShell>
  )
}
