import { Search } from 'lucide-react'
import type { GateSession } from '../../../services/staffGateApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Skeleton } from '../../ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../ui/table'
import { formatGateTime, formatStaffCurrency } from '../data/staffGateUi'
import { formatCustomerType, formatVehicleType } from '../data/staffGateUtils'
import { formatShiftPaymentMethod } from './staffShiftUtils'

type StaffShiftCheckoutListProps = {
  sessions: GateSession[]
  isLoading: boolean
}

export function StaffShiftCheckoutList({ sessions, isLoading }: StaffShiftCheckoutListProps) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>Đối soát checkout</CardDescription>
        <CardTitle>Xe đã ra trong ngày</CardTitle>
        <CardDescription>
          Dùng danh sách này để kiểm tra doanh thu và phương thức thanh toán.
        </CardDescription>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <Skeleton className="h-36 rounded-xl" />
        ) : sessions.length === 0 ? (
          <div className="flex min-h-52 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
              <Search className="size-5" />
            </span>
            <p className="mt-3 text-sm font-semibold">Chưa có xe checkout trong hôm nay</p>
            <p className="mt-1 text-xs text-muted-foreground">Khi staff xử lý xe ra, dữ liệu sẽ xuất hiện ở đây.</p>
          </div>
        ) : (
          <Table className="min-w-[760px]">
            <TableHeader>
              <TableRow>
                <TableHead>Biển số xe</TableHead>
                <TableHead>Phân loại</TableHead>
                <TableHead>Thời gian ra</TableHead>
                <TableHead>Thanh toán</TableHead>
                <TableHead className="text-right">Số tiền</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sessions.map((session) => (
                <ShiftSessionRow key={session._id} session={session} />
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}

function ShiftSessionRow({ session }: { session: GateSession }) {
  return (
    <TableRow>
      <TableCell className="text-lg font-bold tracking-[0.06em]">{session.licensePlate}</TableCell>
      <TableCell className="text-sm font-medium">
        {formatVehicleType(session.vehicleType)} · {formatCustomerType(session.customerType)}
      </TableCell>
      <TableCell className="text-sm font-medium">{formatGateTime(session.exitTime || session.entryTime)}</TableCell>
      <TableCell className="text-sm font-medium">{formatShiftPaymentMethod(session)}</TableCell>
      <TableCell className="text-right text-base font-bold">{formatStaffCurrency(session.fee || 0)}</TableCell>
    </TableRow>
  )
}
