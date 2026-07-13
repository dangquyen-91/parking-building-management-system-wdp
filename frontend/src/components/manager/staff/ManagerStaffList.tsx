import type { ManagerStaffUser } from '../../../services/managerStaffApi'
import type { GateSession } from '../../../services/staffGateApi'
import { ManagerStaffCard } from './ManagerStaffCard'

type ManagerStaffListProps = {
  staff: ManagerStaffUser[]
  sessions: GateSession[]
  isLoading: boolean
}

export function ManagerStaffList({ staff, sessions, isLoading }: ManagerStaffListProps) {
  if (isLoading) {
    return <div className="bg-card text-card-foreground ring-1 ring-border rounded-lg p-4 text-sm text-muted-foreground">Đang tải danh sách nhân viên...</div>
  }

  if (staff.length === 0) {
    return <div className="bg-card text-card-foreground ring-1 ring-border rounded-lg p-4 text-sm text-muted-foreground">Không có nhân viên phù hợp.</div>
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {staff.map((user) => <ManagerStaffCard key={user._id} staff={user} sessions={sessions} />)}
    </section>
  )
}


