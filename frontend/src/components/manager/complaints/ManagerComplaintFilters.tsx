import type { ComplaintStatus } from '../../../services/complaintsApi'
import { MANAGER_COMPLAINT_STATUS_LABELS } from './managerComplaintUi'

export type ManagerComplaintStatusFilter = ComplaintStatus | 'all'

type ManagerComplaintFiltersProps = {
  query: string
  statusFilter: ManagerComplaintStatusFilter
  onQueryChange: (value: string) => void
  onStatusFilterChange: (value: ManagerComplaintStatusFilter) => void
}

export function ManagerComplaintFilters({
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
}: ManagerComplaintFiltersProps) {
  return (
    <section className="mb-5 rounded-3xl border border-theme bg-badge p-4 shadow-sm">
      <div className="grid gap-4 md:grid-cols-[minmax(220px,1fr)_220px]">
        <label className="block">
          <span className="text-xs font-bold text-muted">Tìm theo biển số</span>
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="VD: 59A-482.16"
            className="mt-2 h-12 w-full rounded-2xl border border-theme bg-page px-4 text-sm font-bold text-fg outline-none transition focus:border-sky-400"
          />
        </label>

        <label className="block">
          <span className="text-xs font-bold text-muted">Trạng thái</span>
          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as ManagerComplaintStatusFilter)}
            className="mt-2 h-12 w-full rounded-2xl border border-theme bg-page px-4 text-sm font-bold text-fg outline-none transition focus:border-sky-400"
          >
            <option value="all">Tất cả</option>
            <option value="open">{MANAGER_COMPLAINT_STATUS_LABELS.open}</option>
            <option value="in_progress">{MANAGER_COMPLAINT_STATUS_LABELS.in_progress}</option>
            <option value="resolved">{MANAGER_COMPLAINT_STATUS_LABELS.resolved}</option>
          </select>
        </label>
      </div>
    </section>
  )
}
