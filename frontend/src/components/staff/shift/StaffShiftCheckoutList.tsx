import type { GateSession } from '../../../services/staffGateApi'
import { formatGateTime, formatStaffCurrency } from '../data/staffGateUi'
import { formatCustomerType, formatVehicleType } from '../data/staffGateUtils'
import { formatShiftPaymentMethod } from './staffShiftUtils'

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
        <div>
          {sessions.map((session) => (
            <ShiftSessionRow key={session._id} session={session} />
          ))}
        </div>
      )}
    </section>
  )
}

function ShiftSessionRow({ session }: { session: GateSession }) {
  return (
    <div className="grid gap-3 border-b border-theme px-4 py-4 last:border-b-0 md:grid-cols-[1fr_0.9fr_0.9fr_0.9fr_auto] md:items-center">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-subtle">Biển số xe</p>
        <p className="mt-1 text-lg font-black tracking-[0.06em] text-fg">{session.licensePlate}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-subtle">Phân loại</p>
        <p className="mt-1 text-sm font-semibold text-fg">
          {formatVehicleType(session.vehicleType)} · {formatCustomerType(session.customerType)}
        </p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-subtle">Thời gian ra</p>
        <p className="mt-1 text-sm font-semibold text-fg">{formatGateTime(session.exitTime || session.entryTime)}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-subtle">Thanh toán</p>
        <p className="mt-1 text-sm font-semibold text-fg">{formatShiftPaymentMethod(session)}</p>
      </div>
      <div className="md:text-right">
        <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-subtle">Số tiền</p>
        <p className="mt-1 text-base font-black text-fg">{formatStaffCurrency(session.fee || 0)}</p>
      </div>
    </div>
  )
}
