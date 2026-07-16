import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { GateSession } from '../../../services/staffGateApi'
import { formatStaffVehicleDateTime, formatStaffVehicleDuration } from '../../../utils/staffVehicleUi'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent } from '../../ui/card'
import { formatSessionCustomer, formatSessionSpot, formatVehicleType, isSessionBookingOvertime } from '../data/staffGateUtils'

type StaffVehicleCardProps = {
  session: GateSession
  floorMap: Map<string, Floor>
  onCheckout: (session: GateSession) => void
}

function InfoBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="mt-2">{children}</div>
    </div>
  )
}

export function StaffVehicleCard({ session, floorMap, onCheckout }: StaffVehicleCardProps) {
  return (
    <Card className="border-sky-500/15 bg-gradient-to-r from-background via-background to-sky-500/5 transition-shadow hover:shadow-md hover:shadow-sky-500/10">
      <CardContent className="grid gap-4 p-4 lg:grid-cols-[1.05fr_0.8fr_1.25fr_1fr_auto] lg:items-center">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Biển số xe</p>
          <p className="truncate text-2xl font-bold tracking-[0.06em] text-sky-700 dark:text-sky-300">{session.licensePlate}</p>
        </div>

        <InfoBlock label="Phân loại">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{formatVehicleType(session.vehicleType)}</Badge>
            <Badge
              variant={
                session.customerType === 'resident'
                  ? 'default'
                  : session.bookingId
                    ? 'secondary'
                    : 'outline'
              }
            >
              {formatSessionCustomer(session)}
            </Badge>
            {isSessionBookingOvertime(session) && (
              <Badge variant="destructive">Quá giờ · vãng lai</Badge>
            )}
          </div>
        </InfoBlock>

        <InfoBlock label="Vị trí hiện tại">
          <p className="line-clamp-2 text-sm font-medium leading-5">{formatSessionSpot(session, floorMap)}</p>
        </InfoBlock>

        <InfoBlock label="Thời gian gửi">
          <p className="text-sm font-medium">{formatStaffVehicleDateTime(session.entryTime)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Đã gửi {formatStaffVehicleDuration(session.entryTime)}
          </p>
        </InfoBlock>

        <Button type="button" onClick={() => onCheckout(session)}>
          Xử lý xe ra
          <ArrowRight className="size-4" />
        </Button>
      </CardContent>
    </Card>
  )
}
