import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ManagerIncident } from '../../../services/managerIncidentsApi'
import {
  formatLostTicketCurrency,
  formatLostTicketDateTime,
  getIncidentSession,
  getIncidentStaffName,
  getIncidentVehicleType,
  getLostTicketStatus,
  LOST_TICKET_STATUS_LABELS,
  LOST_TICKET_STATUS_TONES,
  LOST_TICKET_VEHICLE_LABELS,
} from './managerLostTicketUi'
import { ManagerLostTicketDetailsDialog } from './ManagerLostTicketDetailsDialog'

type ManagerLostTicketCardProps = {
  incident: ManagerIncident
}

function InfoCell({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div className="flex min-h-20 min-w-0 flex-col justify-start rounded-xl bg-background/55 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate font-semibold text-foreground" title={value}>{value}</p>
      {subValue && <p className="mt-1 truncate text-xs text-muted-foreground">{subValue}</p>}
    </div>
  )
}

export function ManagerLostTicketCard({ incident }: ManagerLostTicketCardProps) {
  const session = getIncidentSession(incident)
  const vehicleType = getIncidentVehicleType(incident)
  const status = getLostTicketStatus(incident)
  const totalSessionFee = session?.fee ?? incident.fineAmount ?? 0

  return (
    <article className="rounded-2xl border border-border bg-card p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:bg-muted hover:shadow-lg">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6 xl:items-stretch">
        <div className="flex min-h-20 min-w-0 flex-col justify-start rounded-xl bg-background/55 p-3">
          <p className="text-xs text-muted-foreground">Biển số xe</p>
          <p className="mt-1 truncate text-lg font-black tracking-[0.06em] text-foreground">
            {incident.licensePlate}
          </p>
        </div>

        <InfoCell
          label="Phân loại"
          value={vehicleType ? LOST_TICKET_VEHICLE_LABELS[vehicleType] : 'Không rõ loại xe'}
          subValue="Sự cố mất vé"
        />
        <InfoCell
          label="Nhân viên xử lý"
          value={getIncidentStaffName(incident.staffId)}
          subValue={formatLostTicketDateTime(incident.createdAt)}
        />
        <div className="flex min-h-20 min-w-0 flex-col justify-start rounded-xl bg-background/55 p-3">
          <p className="text-xs text-muted-foreground">Trạng thái</p>
          <div className="mt-2">
            <Badge variant="outline" className={`gap-1.5 ${LOST_TICKET_STATUS_TONES[status]}`}>
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              {LOST_TICKET_STATUS_LABELS[status]}
            </Badge>
          </div>
        </div>
        <InfoCell
          label="Tổng thanh toán"
          value={formatLostTicketCurrency(totalSessionFee)}
          subValue={`Phạt mất vé ${formatLostTicketCurrency(incident.fineAmount || 0)}`}
        />

        <div className="flex min-h-20 items-center rounded-xl bg-background/55 p-3">
          <ManagerLostTicketDetailsDialog
            incident={incident}
            trigger={
              <Button type="button" variant="outline" className="h-10 w-full rounded-xl font-semibold">
                Xem chi tiết
              </Button>
            }
          />
        </div>
      </div>
    </article>
  )
}
