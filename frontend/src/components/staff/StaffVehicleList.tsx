import type { Floor } from '../../services/managerBuildingsApi'
import type { GateSession } from '../../services/staffGateApi'
import { StaffVehicleCard } from './StaffVehicleCard'

type StaffVehicleListProps = {
  sessions: GateSession[]
  floorMap: Map<string, Floor>
  isLoading: boolean
  error: string | null
  onCheckout: (session: GateSession) => void
}

export function StaffVehicleList({
  sessions,
  floorMap,
  isLoading,
  error,
  onCheckout,
}: StaffVehicleListProps) {
  if (error) {
    return (
      <p className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-200">
        {error}
      </p>
    )
  }

  if (isLoading) {
    return <p className="rounded-lg border border-theme bg-badge p-4 text-sm text-muted">Đang tải danh sách xe đang gửi...</p>
  }

  if (sessions.length === 0) {
    return <p className="rounded-lg border border-theme bg-badge p-4 text-sm text-muted">Không có xe đang gửi phù hợp.</p>
  }

  return (
    <div className="grid gap-3">
      {sessions.map((session) => (
        <StaffVehicleCard key={session._id} session={session} floorMap={floorMap} onCheckout={onCheckout} />
      ))}
    </div>
  )
}
