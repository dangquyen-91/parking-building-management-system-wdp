import type { ManagerStaffUser } from '../../../services/managerStaffApi'
import type { GateSession } from '../../../services/staffGateApi'
import { ManagerStatCard } from '../common/ManagerStatCard'

type ManagerStaffStatsProps = {
  staff: ManagerStaffUser[]
  sessions: GateSession[]
  isLoading: boolean
}

export function ManagerStaffStats({ staff, sessions, isLoading }: ManagerStaffStatsProps) {
  const activeAccounts = staff.filter((user) => user.isActive).length
  const handlingStaffIds = new Set(
    sessions
      .map((session) => (typeof session.staffId === 'string' ? session.staffId : session.staffId?._id))
      .filter(Boolean),
  )

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <ManagerStatCard label="Tổng nhân viên" value={isLoading ? '-' : staff.length} detail="Tài khoản có vai trò staff" />
      <ManagerStatCard label="Tài khoản hoạt động" value={isLoading ? '-' : activeAccounts} detail={`${staff.length - activeAccounts} tài khoản đã khóa`} />
      <ManagerStatCard label="Đang có xe phụ trách" value={isLoading ? '-' : handlingStaffIds.size} detail="Có phiên gửi xe đang hoạt động" />
      <ManagerStatCard label="Xe đang theo dõi" value={isLoading ? '-' : sessions.length} detail="Tổng phiên xe chưa checkout" />
    </div>
  )
}
