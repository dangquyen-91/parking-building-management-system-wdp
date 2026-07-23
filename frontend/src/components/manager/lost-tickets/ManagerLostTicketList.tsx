import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { TableCell, TableRow } from '@/components/ui/table'
import type { ManagerIncident } from '../../../services/managerIncidentsApi'
import { ManagerTableShell } from '../common/ManagerTableShell'
import { ManagerLostTicketDetailsDialog } from './ManagerLostTicketDetailsDialog'
import { formatLostTicketCurrency, formatLostTicketDateTime, getIncidentSession, getIncidentStaffName, getIncidentVehicleType, getLostTicketStatus, LOST_TICKET_STATUS_LABELS, LOST_TICKET_STATUS_TONES, LOST_TICKET_VEHICLE_LABELS } from './managerLostTicketUi'

type Props = { incidents: ManagerIncident[]; isLoading: boolean }
export function ManagerLostTicketList({ incidents, isLoading }: Props) {
  if (isLoading) return <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm font-semibold text-muted-foreground">Đang tải danh sách mất vé...</div>
  if (!incidents.length) return <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center"><h2 className="text-xl font-black text-foreground">Chưa có ca mất vé phù hợp</h2><p className="mt-2 text-sm text-muted-foreground">Các ca mất vé do staff xử lý sẽ xuất hiện tại đây.</p></div>
  return <ManagerTableShell eyebrow="Đối soát sự cố" title="Danh sách mất vé" countLabel={`${incidents.length} ca`} minWidth="1080px" columns={[
    { label: 'Biển số', className: 'w-[17%]' }, { label: 'Phân loại', className: 'w-[16%]' }, { label: 'Nhân viên xử lý', className: 'w-[21%]' }, { label: 'Trạng thái', className: 'w-[15%]' }, { label: 'Tổng thanh toán', className: 'w-[17%]' }, { label: 'Thao tác', className: 'w-[14%] text-right' },
  ]}>
    {incidents.map((incident) => {
      const session = getIncidentSession(incident); const vehicleType = getIncidentVehicleType(incident); const status = getLostTicketStatus(incident)
      return <TableRow key={incident._id}>
        <TableCell className="px-4 py-4 font-black tracking-[0.06em] text-foreground">{incident.licensePlate}</TableCell>
        <TableCell className="px-4 py-4"><p className="font-semibold text-foreground">{vehicleType ? LOST_TICKET_VEHICLE_LABELS[vehicleType] : 'Không rõ loại xe'}</p><p className="mt-1 text-xs text-muted-foreground">Sự cố mất vé</p></TableCell>
        <TableCell className="px-4 py-4"><p className="font-semibold text-foreground">{getIncidentStaffName(incident.staffId)}</p><p className="mt-1 text-xs text-muted-foreground">{formatLostTicketDateTime(incident.createdAt)}</p></TableCell>
        <TableCell className="px-4 py-4"><Badge variant="outline" className={`gap-1.5 ${LOST_TICKET_STATUS_TONES[status]}`}><span className="h-1.5 w-1.5 rounded-full bg-current" />{LOST_TICKET_STATUS_LABELS[status]}</Badge></TableCell>
        <TableCell className="px-4 py-4"><p className="font-bold text-foreground">{formatLostTicketCurrency(session?.fee ?? incident.fineAmount ?? 0)}</p><p className="mt-1 text-xs text-muted-foreground">Phạt {formatLostTicketCurrency(incident.fineAmount || 0)}</p></TableCell>
        <TableCell className="px-4 py-4 text-right"><ManagerLostTicketDetailsDialog incident={incident} trigger={<Button type="button" variant="outline" size="sm">Xem chi tiết</Button>} /></TableCell>
      </TableRow>
    })}
  </ManagerTableShell>
}
