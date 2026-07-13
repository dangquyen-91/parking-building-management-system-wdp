import type { ManagerStaffUser } from '../../../services/managerStaffApi'
import type { GateSession } from '../../../services/staffGateApi'
import { ManagerStatusBadge } from '../common/ManagerStatusBadge'

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
    <article className="bg-card text-card-foreground ring-1 ring-border rounded-2xl border border-border p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="mb-3 flex size-11 items-center justify-center rounded-2xl border border-border bg-gradient-to-br from-sky-500/20 to-emerald-500/20 text-sm font-black text-foreground">
            {(staff.fullName || staff.email).slice(0, 2).toUpperCase()}
          </div>
          <p className="truncate text-lg font-black text-foreground">{staff.fullName}</p>
          <p className="mt-1 truncate text-xs text-muted-foreground">{staff.email}</p>
        </div>
        <ManagerStatusBadge
          status={staff.isActive ? 'active' : 'inactive'}
          label={staff.isActive ? 'Đang hoạt động' : 'Đã khóa'}
        />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-muted-foreground">Số điện thoại</dt>
          <dd className="mt-1 font-medium text-foreground">{staff.phone || 'Chưa cập nhật'}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Xe đang phụ trách</dt>
          <dd className="mt-1 font-medium text-foreground">{staffSessions.length}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Ô tô</dt>
          <dd className="mt-1 font-medium text-foreground">{carCount}</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">Xe máy</dt>
          <dd className="mt-1 font-medium text-foreground">{motorcycleCount}</dd>
        </div>
      </dl>

      {staffSessions.length > 0 && (
        <div className="mt-4 border-t border-border pt-3">
          <p className="text-xs font-medium text-muted-foreground">Biển số đang theo dõi</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {staffSessions.slice(0, 5).map((session) => (
              <span key={session._id} className="rounded-full border border-border bg-card px-2.5 py-1 text-[11px] font-semibold text-foreground">
                {session.licensePlate}
              </span>
            ))}
            {staffSessions.length > 5 && <span className="px-2 py-1 text-[11px] text-muted-foreground">+{staffSessions.length - 5} xe</span>}
          </div>
        </div>
      )}
    </article>
  )
}


