import type { GateCustomerType, GateVehicleType } from '../../../services/staffGateApi'
import { formatCustomerType, formatVehicleType } from '../data/staffGateUtils'

type StaffGateCheckInSummaryProps = {
  plate: string
  customerType?: GateCustomerType
  vehicleType: GateVehicleType
  qrVerified: boolean
  note: string
}

export function StaffGateCheckInSummary({
  plate,
  customerType,
  vehicleType,
  qrVerified,
  note,
}: StaffGateCheckInSummaryProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-theme bg-badge">
      <div className="border-b border-theme bg-gradient-to-r from-emerald-500/10 to-transparent p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-subtle">Tóm tắt xe vào</p>
        <p className="mt-1 text-3xl font-black tracking-[0.08em] text-fg">{plate || 'Chưa có biển số'}</p>
      </div>
      <dl className="grid gap-px bg-[color:var(--border)] sm:grid-cols-2">
        <SummaryItem label="Loại khách" value={customerType ? formatCustomerType(customerType) : 'Chưa xác định'} />
        <SummaryItem label="Loại xe" value={formatVehicleType(vehicleType)} />
        <SummaryItem label="QR" value={qrVerified ? 'Đã xác minh' : 'Chưa xác minh'} />
        <SummaryItem label="Ghi chú" value={note.trim() || 'Không có'} />
      </dl>
    </div>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-page p-4">
      <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-subtle">{label}</dt>
      <dd className="mt-1.5 font-semibold text-fg">{value}</dd>
    </div>
  )
}
