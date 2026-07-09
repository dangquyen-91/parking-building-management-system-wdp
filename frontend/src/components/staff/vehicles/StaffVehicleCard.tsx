import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { GateSession } from '../../../services/staffGateApi'
import { formatStaffVehicleDateTime, formatStaffVehicleDuration } from '../../../utils/staffVehicleUi'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent } from '../../ui/card'
import { formatCustomerType, formatSessionSpot, formatVehicleType } from '../data/staffGateUtils'

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
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="grid gap-4 p-4 lg:grid-cols-[1.05fr_0.8fr_1.25fr_1fr_auto] lg:items-center">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-medium text-muted-foreground">Biển số xe</p>
          <p className="truncate text-2xl font-bold tracking-[0.06em]">{session.licensePlate}</p>
        </div>

        <InfoBlock label="Phân loại">
          <div className="flex flex-wrap gap-1.5">
            <Badge variant="secondary">{formatVehicleType(session.vehicleType)}</Badge>
            <Badge variant={session.customerType === 'resident' ? 'default' : 'outline'}>
              {formatCustomerType(session.customerType)}
            </Badge>
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
