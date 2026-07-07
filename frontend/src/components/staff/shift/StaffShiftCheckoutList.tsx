import type { GateSession } from '../../../services/staffGateApi'
import { formatGateTime, formatStaffCurrency } from '../data/staffGateUi'
import { formatCustomerType, formatVehicleType } from '../data/staffGateUtils'
import { formatShiftPaymentMethod } from './staffShiftUtils'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'

type StaffShiftCheckoutListProps = {
  sessions: GateSession[]
  isLoading: boolean
}

export function StaffShiftCheckoutList({ sessions, isLoading }: StaffShiftCheckoutListProps) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-theme bg-badge shadow-sm">
      <div className="border-b border-theme bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-subtle">Đối soát checkout</p>
        <h2 className="mt-1 text-xl font-black text-fg">Xe đã ra trong ngày</h2>
        <p className="mt-1 text-sm text-muted">
          Dùng danh sách này để kiểm tra doanh thu và phương thức thanh toán.
        </p>
      </div>

      {isLoading ? (
        <p className="p-6 text-center text-sm text-muted">Đang tải dữ liệu tổng kết ca...</p>
      ) : sessions.length === 0 ? (
        <div className="flex min-h-52 flex-col items-center justify-center p-6 text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-ghost text-xl text-muted">⌕</span>
          <p className="mt-3 text-sm font-bold text-fg">Chưa có xe checkout trong hôm nay</p>
          <p className="mt-1 text-xs text-muted">Khi staff xử lý xe ra, dữ liệu sẽ xuất hiện ở đây.</p>
        </div>
      ) : (
        <Table className="min-w-[760px]">
          <TableHeader className="bg-page/35 text-xs text-subtle">
            <TableRow className="border-theme hover:bg-transparent">
              <TableHead className="h-auto px-4 py-3 text-subtle">Biển số xe</TableHead>
              <TableHead className="h-auto px-3 py-3 text-subtle">Phân loại</TableHead>
              <TableHead className="h-auto px-3 py-3 text-subtle">Thời gian ra</TableHead>
              <TableHead className="h-auto px-3 py-3 text-subtle">Thanh toán</TableHead>
              <TableHead className="h-auto px-4 py-3 text-right text-subtle">Số tiền</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
          {sessions.map((session) => (
            <ShiftSessionRow key={session._id} session={session} />
          ))}
          </TableBody>
        </Table>
      )}
    </section>
  )
}

function ShiftSessionRow({ session }: { session: GateSession }) {
  return (
    <TableRow className="border-theme hover:bg-emerald-500/5">
      <TableCell className="px-4 py-4 text-lg font-black tracking-[0.06em] text-fg">{session.licensePlate}</TableCell>
      <TableCell className="px-3 py-4 text-sm font-semibold text-fg">
          {formatVehicleType(session.vehicleType)} · {formatCustomerType(session.customerType)}
      </TableCell>
      <TableCell className="px-3 py-4 text-sm font-semibold text-fg">{formatGateTime(session.exitTime || session.entryTime)}</TableCell>
      <TableCell className="px-3 py-4 text-sm font-semibold text-fg">{formatShiftPaymentMethod(session)}</TableCell>
      <TableCell className="px-4 py-4 text-right text-base font-black text-fg">{formatStaffCurrency(session.fee || 0)}</TableCell>
    </TableRow>
  )
}
