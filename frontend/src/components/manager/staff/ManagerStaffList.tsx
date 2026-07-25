import type { ManagerStaffUser } from '../../../services/managerStaffApi'
import type { GateSession } from '../../../services/staffGateApi'
import { Button } from '@/components/ui/button'
import { TableCell, TableRow } from '@/components/ui/table'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'
import { ManagerTableShell } from '../common/ManagerTableShell'
import { ManagerStaffDetailsDialog } from './ManagerStaffDetailsDialog'

type ManagerStaffListProps = { staff: ManagerStaffUser[]; sessions: GateSession[]; isLoading: boolean }

export function ManagerStaffList({ staff, sessions, isLoading }: ManagerStaffListProps) {
  if (isLoading) return <div className="rounded-lg bg-card p-4 text-sm text-muted-foreground ring-1 ring-border">Đang tải danh sách nhân viên...</div>
  if (staff.length === 0) return <div className="rounded-lg bg-card p-4 text-sm text-muted-foreground ring-1 ring-border">Không có nhân viên phù hợp.</div>

  return (
    <ManagerTableShell
      eyebrow="Đội ngũ vận hành" title="Danh sách nhân viên" countLabel={`${staff.length} nhân viên`} minWidth="1080px"
      columns={[
        { label: 'Nhân viên', className: 'w-[20%]' }, { label: 'Liên hệ', className: 'w-[16%]' },
        { label: 'Trạng thái', className: 'w-[13%]' }, { label: 'Xe phụ trách', className: 'w-[11%]' },
        { label: 'Phân loại', className: 'w-[12%]' }, { label: 'Biển số theo dõi', className: 'w-[16%]' },
        { label: 'Thao tác', className: 'w-[12%] text-right' },
      ]}
    >
      {staff.map((user) => {
        const staffSessions = sessions.filter((session) => (typeof session.staffId === 'string' ? session.staffId : session.staffId?._id) === user._id)
        const cars = staffSessions.filter((session) => session.vehicleType === 'car').length
        const motorcycles = staffSessions.length - cars
        return (
          <TableRow key={user._id}>
            <TableCell className="px-4 py-4"><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-xl border border-border bg-gradient-to-br from-sky-500/20 to-emerald-500/20 text-xs font-black">{(user.fullName || user.email).slice(0, 2).toUpperCase()}</span><div className="min-w-0"><p className="truncate font-bold text-foreground">{user.fullName}</p><p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p></div></div></TableCell>
            <TableCell className="px-4 py-4 text-foreground">{user.phone || 'Chưa cập nhật'}</TableCell>
            <TableCell className="px-4 py-4"><ManagerStatusBadge status={user.isActive ? 'active' : 'inactive'} label={user.isActive ? 'Đang hoạt động' : 'Đã khóa'} /></TableCell>
            <TableCell className="px-4 py-4 font-bold text-foreground">{staffSessions.length} xe</TableCell>
            <TableCell className="px-4 py-4"><p className="text-foreground">Ô tô: {cars}</p><p className="mt-1 text-xs text-muted-foreground">Xe máy: {motorcycles}</p></TableCell>
            <TableCell className="px-4 py-4"><p className="truncate text-xs font-semibold text-foreground" title={staffSessions.map((session) => session.licensePlate).join(', ')}>{staffSessions.length ? staffSessions.map((session) => session.licensePlate).join(', ') : 'Chưa có xe'}</p></TableCell>
            <TableCell className="px-4 py-4 text-right">
              <ManagerStaffDetailsDialog
                staff={user}
                sessions={sessions}
                trigger={<Button type="button" variant="outline" size="sm">Xem chi tiết</Button>}
              />
            </TableCell>
          </TableRow>
        )
      })}
    </ManagerTableShell>
  )
}
