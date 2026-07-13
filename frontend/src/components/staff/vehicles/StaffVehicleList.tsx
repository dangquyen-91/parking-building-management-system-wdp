import { Search } from 'lucide-react'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { GateSession } from '../../../services/staffGateApi'
import { Alert, AlertDescription } from '../../ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Skeleton } from '../../ui/skeleton'
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
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (isLoading) {
    return <Skeleton className="h-40 rounded-xl" />
  }

  if (sessions.length === 0) {
    return (
      <Card className="border-dashed">
        <CardHeader className="items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Search className="size-5" />
          </span>
          <CardTitle>Không tìm thấy xe phù hợp</CardTitle>
          <CardDescription>Thử thay đổi biển số hoặc bộ lọc đang chọn.</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <CardContent className="grid gap-3 p-0">
      {sessions.map((session) => (
        <StaffVehicleCard key={session._id} session={session} floorMap={floorMap} onCheckout={onCheckout} />
      ))}
    </CardContent>
  )
}
