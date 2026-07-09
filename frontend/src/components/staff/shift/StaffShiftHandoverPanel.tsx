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
      <section className="rounded-[1.75rem] border border-theme bg-badge p-5 shadow-sm">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-subtle">Tóm tắt nhanh</p>
        <dl className="mt-4 grid gap-3 text-sm">
          <SummaryLine label="Nhân viên đối soát" value={lastStaffName} />
          <SummaryLine label="Tiền mặt" value={formatStaffCurrency(cashRevenue)} />
          <SummaryLine label="Chuyển khoản" value={formatStaffCurrency(transferRevenue)} />
          <SummaryLine label="Xe cần bàn giao" value={`${activeCount} xe`} />
        </dl>
      </section>
    </aside>
  )
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-theme bg-page px-4 py-3">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-right text-sm font-black text-fg">{value}</dd>
    </div>
  )
}
