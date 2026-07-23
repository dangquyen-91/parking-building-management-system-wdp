import type { GateCustomerType, GateVehicleType } from '../../../services/staffGateApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
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
    <Card>
      <CardHeader>
        <CardDescription>Tóm tắt xe vào</CardDescription>
        <CardTitle className="text-3xl tracking-[0.08em]">{plate || 'Chưa có biển số'}</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="grid gap-3 sm:grid-cols-2">
          <SummaryItem label="Loại khách" value={customerType ? formatCustomerType(customerType) : 'Chưa xác định'} />
          <SummaryItem label="Loại xe" value={formatVehicleType(vehicleType)} />
          <SummaryItem label="QR" value={qrVerified ? 'Đã xác minh' : 'Chưa xác minh'} />
          <SummaryItem label="Ghi chú" value={note.trim() || 'Không có'} />
        </dl>
      </CardContent>
    </Card>
  )
}

function SummaryItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 font-medium">{value}</dd>
    </div>
  )
}
