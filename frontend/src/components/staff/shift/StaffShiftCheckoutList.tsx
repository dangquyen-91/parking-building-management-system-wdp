import { Search } from 'lucide-react'
import type { GateSession } from '../../../services/staffGateApi'
import { Card, CardContent } from '../../ui/card'
import { Skeleton } from '../../ui/skeleton'
import { TableCell, TableRow } from '../../ui/table'
import { StaffTableShell } from '../common/StaffTableShell'
import { formatGateTime, formatStaffCurrency } from '../data/staffGateUi'
import { formatSessionCustomer, formatVehicleType } from '../data/staffGateUtils'
import { formatShiftPaymentMethod } from './staffShiftUtils'

type StaffShiftCheckoutListProps = { sessions: GateSession[]; isLoading: boolean }

export function StaffShiftCheckoutList({ sessions, isLoading }: StaffShiftCheckoutListProps) {
  if (isLoading) return <Card><CardContent className="p-5"><Skeleton className="h-36 rounded-xl" /></CardContent></Card>
  if (!sessions.length) return <Card><CardContent className="flex min-h-52 flex-col items-center justify-center p-6 text-center"><span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground"><Search className="size-5" /></span><p className="mt-3 text-sm font-semibold">Chưa có xe checkout trong hôm nay</p><p className="mt-1 text-xs text-muted-foreground">Khi staff xử lý xe ra, dữ liệu sẽ xuất hiện ở đây.</p></CardContent></Card>

  return <StaffTableShell eyebrow="Đối soát checkout" title="Xe đã ra trong ngày" countLabel={`${sessions.length} lượt`} minWidth="760px" columns={[
    { label: 'Biển số xe', className: 'w-[22%]' }, { label: 'Phân loại', className: 'w-[23%]' }, { label: 'Thời gian ra', className: 'w-[20%]' }, { label: 'Thanh toán', className: 'w-[20%]' }, { label: 'Số tiền', className: 'w-[15%] text-right' },
  ]}>
    {sessions.map((session) => <TableRow key={session._id}>
      <TableCell className="px-4 py-4 text-lg font-bold tracking-[0.06em] text-foreground">{session.licensePlate}</TableCell>
      <TableCell className="px-4 py-4 font-medium text-foreground">{formatVehicleType(session.vehicleType)} · {formatSessionCustomer(session)}</TableCell>
      <TableCell className="px-4 py-4 font-medium text-foreground">{formatGateTime(session.exitTime || session.entryTime)}</TableCell>
      <TableCell className="px-4 py-4 font-medium text-foreground">{formatShiftPaymentMethod(session)}</TableCell>
      <TableCell className="px-4 py-4 text-right text-base font-bold text-foreground">{formatStaffCurrency(session.fee || 0)}</TableCell>
    </TableRow>)}
  </StaffTableShell>
}
