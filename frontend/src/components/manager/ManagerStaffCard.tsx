import type { ManagerStaffUser } from '../../services/managerStaffApi'
import type { GateSession } from '../../services/staffGateApi'
import { ManagerStatusBadge } from './ManagerStatusBadge'

type ManagerStaffCardProps = {
  staff: ManagerStaffUser
  sessions: GateSession[]
}

export function ManagerStaffCard({ staff, sessions }: ManagerStaffCardProps) {
  const staffSessions = sessions.filter((session) => {
    const staffId = typeof session.staffId === 'string' ? session.staffId : session.staffId?._id
    return staffId === staff._id
  })
  const carCount = staffSessions.filter((session) => session.vehicleType === 'car').length
  const motorcycleCount = staffSessions.filter((session) => session.vehicleType === 'motorcycle').length

  return (
    <article className="liquid-glass-card rounded-lg p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-lg font-semibold text-fg">{staff.fullName}</p>
          <p className="mt-1 truncate text-xs text-subtle">{staff.email}</p>
        </div>
        <ManagerStatusBadge
          status={staff.isActive ? 'active' : 'inactive'}
          label={staff.isActive ? 'Đang hoạt động' : 'Đã khóa'}
        />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-subtle">Số điện thoại</dt>
          <dd className="mt-1 font-medium text-fg">{staff.phone || 'Chưa cập nhật'}</dd>
        </div>
        <div>
          <dt className="text-subtle">Xe đang phụ trách</dt>
          <dd className="mt-1 font-medium text-fg">{staffSessions.length}</dd>
        </div>
        <div>
          <dt className="text-subtle">Ô tô</dt>
          <dd className="mt-1 font-medium text-fg">{carCount}</dd>
        </div>
        <div>
          <dt className="text-subtle">Xe máy</dt>
          <dd className="mt-1 font-medium text-fg">{motorcycleCount}</dd>
        </div>
      </dl>

      {staffSessions.length > 0 && (
        <div className="mt-4 border-t border-theme pt-3">
          <p className="text-xs font-medium text-subtle">Biển số đang theo dõi</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {staffSessions.slice(0, 5).map((session) => (
              <span key={session._id} className="rounded-full border border-theme bg-badge px-2.5 py-1 text-[11px] font-semibold text-fg">
                {session.licensePlate}
              </span>
            ))}
            {staffSessions.length > 5 && <span className="px-2 py-1 text-[11px] text-muted">+{staffSessions.length - 5} xe</span>}
          </div>
        </div>
      )}
    </article>
  )
}
