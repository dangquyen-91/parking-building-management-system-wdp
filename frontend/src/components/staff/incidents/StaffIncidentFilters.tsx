import type { ComplaintStatus } from '../../../services/complaintsApi'
import { INCIDENT_STATUS_LABELS } from './staffIncidentUtils'

type IncidentFilter = ComplaintStatus | 'all'

type StaffIncidentFiltersProps = {
  statusFilter: IncidentFilter
  onStatusFilterChange: (status: IncidentFilter) => void
}

const FILTER_OPTIONS: Array<{ value: IncidentFilter; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'open', label: INCIDENT_STATUS_LABELS.open },
  { value: 'in_progress', label: INCIDENT_STATUS_LABELS.in_progress },
  { value: 'resolved', label: INCIDENT_STATUS_LABELS.resolved },
]

export function StaffIncidentFilters({
  statusFilter,
  onStatusFilterChange,
}: StaffIncidentFiltersProps) {
  return (
    <section className="mb-5 rounded-3xl border border-theme bg-badge p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-subtle">Bộ lọc xử lý</p>
          <p className="mt-1 text-sm text-muted">Chọn nhóm khiếu nại cần ưu tiên trong ca trực.</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <select
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as IncidentFilter)}
            className="auth-input h-11 rounded-xl border px-4 text-sm font-bold text-fg sm:min-w-40"
            aria-label="Lọc trạng thái khiếu nại"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </section>
  )
}
