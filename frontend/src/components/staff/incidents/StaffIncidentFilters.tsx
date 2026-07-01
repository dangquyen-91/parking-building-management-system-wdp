import type { ComplaintStatus } from '../../../services/complaintsApi'

type StaffIncidentFiltersProps = {
  statusFilter: ComplaintStatus | 'all'
  onStatusFilterChange: (status: ComplaintStatus | 'all') => void
}

export function StaffIncidentFilters({
  statusFilter,
  onStatusFilterChange,
}: StaffIncidentFiltersProps) {
  return (
    <section className="mb-5 rounded-2xl border border-theme bg-badge p-4">
      <label className="grid gap-2 sm:max-w-xs">
        <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-subtle">Trạng thái</span>
        <select
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as ComplaintStatus | 'all')}
          className="auth-input h-12 rounded-xl border px-4 text-sm font-bold text-fg"
        >
          <option value="all">Tất cả</option>
          <option value="open">Mới gửi</option>
          <option value="in_progress">Đang xử lý</option>
          <option value="resolved">Đã xử lý</option>
        </select>
      </label>
    </section>
  )
}
