import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { formatStaffCurrency } from '../data/staffGateUi'

type StaffShiftHandoverPanelProps = {
  lastStaffName: string
  cashRevenue: number
  transferRevenue: number
  activeCount: number
}

export function StaffShiftHandoverPanel({
  lastStaffName,
  cashRevenue,
  transferRevenue,
  activeCount,
}: StaffShiftHandoverPanelProps) {
  return (
    <aside className="grid gap-5">
      <Card>
        <CardHeader>
          <CardDescription>Bàn giao</CardDescription>
          <CardTitle>Tóm tắt nhanh</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm">
            <SummaryLine label="Nhân viên đối soát" value={lastStaffName} />
            <SummaryLine label="Tiền mặt" value={formatStaffCurrency(cashRevenue)} />
            <SummaryLine label="Chuyển khoản" value={formatStaffCurrency(transferRevenue)} />
            <SummaryLine label="Xe cần bàn giao" value={`${activeCount} xe`} />
          </dl>
        </CardContent>
      </Card>
    </aside>
  )
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border bg-muted/30 px-4 py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-right text-sm font-semibold">{value}</dd>
    </div>
  )
}
