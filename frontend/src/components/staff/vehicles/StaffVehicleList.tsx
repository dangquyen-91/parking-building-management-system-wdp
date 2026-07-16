import { ArrowRight, Search } from 'lucide-react'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { GateSession } from '../../../services/staffGateApi'
import { formatStaffVehicleDateTime, formatStaffVehicleDuration } from '../../../utils/staffVehicleUi'
import { Alert, AlertDescription } from '../../ui/alert'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Skeleton } from '../../ui/skeleton'
import { TableCell, TableRow } from '../../ui/table'
import { StaffTableShell } from '../common/StaffTableShell'
import { formatSessionCustomer, formatSessionSpot, formatVehicleType, isSessionBookingOvertime } from '../data/staffGateUtils'

type StaffVehicleListProps = { sessions: GateSession[]; floorMap: Map<string, Floor>; isLoading: boolean; error: string | null; onCheckout: (session: GateSession) => void }

export function StaffVehicleList({ sessions, floorMap, isLoading, error, onCheckout }: StaffVehicleListProps) {
  if (error) return <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
  if (isLoading) return <Skeleton className="h-40 rounded-xl" />
  if (!sessions.length) return <Card className="border-dashed"><CardHeader className="items-center text-center"><span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Search className="size-5" /></span><CardTitle>Không tìm thấy xe phù hợp</CardTitle><CardDescription>Thử thay đổi biển số hoặc bộ lọc đang chọn.</CardDescription></CardHeader></Card>

  return <StaffTableShell eyebrow="Theo dõi trong bãi" title="Xe đang gửi" countLabel={`${sessions.length} xe`} minWidth="980px" columns={[
    { label: 'Biển số', className: 'w-[18%]' }, { label: 'Phân loại', className: 'w-[19%]' }, { label: 'Vị trí hiện tại', className: 'w-[27%]' }, { label: 'Thời gian gửi', className: 'w-[22%]' }, { label: 'Thao tác', className: 'w-[14%] text-right' },
  ]}>
    {sessions.map((session) => <TableRow key={session._id}>
      <TableCell className="px-4 py-4 text-lg font-black tracking-[0.06em] text-sky-700 dark:text-sky-300">{session.licensePlate}</TableCell>
      <TableCell className="px-4 py-4"><div className="flex flex-wrap gap-1.5"><Badge variant="secondary">{formatVehicleType(session.vehicleType)}</Badge><Badge variant={session.customerType === 'resident' ? 'default' : session.bookingId ? 'secondary' : 'outline'}>{formatSessionCustomer(session)}</Badge>{isSessionBookingOvertime(session) && <Badge variant="destructive">Quá giờ · vãng lai</Badge>}</div></TableCell>
      <TableCell className="px-4 py-4"><p className="line-clamp-2 whitespace-normal font-medium text-foreground" title={formatSessionSpot(session, floorMap)}>{formatSessionSpot(session, floorMap)}</p></TableCell>
      <TableCell className="px-4 py-4"><p className="font-medium text-foreground">{formatStaffVehicleDateTime(session.entryTime)}</p><p className="mt-1 text-xs text-muted-foreground">Đã gửi {formatStaffVehicleDuration(session.entryTime)}</p></TableCell>
      <TableCell className="px-4 py-4 text-right"><Button type="button" size="sm" onClick={() => onCheckout(session)}>Xử lý xe ra<ArrowRight className="size-4" /></Button></TableCell>
    </TableRow>)}
  </StaffTableShell>
}
