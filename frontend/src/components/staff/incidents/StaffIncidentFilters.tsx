import type { ComplaintStatus } from '../../../services/complaintsApi'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { NativeSelect } from '../../ui/native-select'
import { INCIDENT_STATUS_LABELS } from './staffIncidentUtils'

export type StaffIncidentStatusFilter = ComplaintStatus | 'all'

type StaffIncidentFiltersProps = {
  query: string
  statusFilter: StaffIncidentStatusFilter
  onQueryChange: (value: string) => void
  onStatusFilterChange: (status: StaffIncidentStatusFilter) => void
}

export function StaffIncidentFilters({
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
}: StaffIncidentFiltersProps) {
  return (
    <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2 xl:w-auto xl:min-w-[32rem]">
      <Label className="grid min-w-0 gap-2 text-xs font-medium text-muted-foreground">
        Tìm biển số
        <Input
          className="h-10 uppercase tracking-wide"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Ví dụ: 59A-482.16"
        />
      </Label>

      <Label className="grid min-w-0 gap-2 text-xs font-medium text-muted-foreground">
        Trạng thái
        <NativeSelect
          className="w-full [&_[data-slot=native-select]]:h-10"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as StaffIncidentStatusFilter)}
          aria-label="Lọc trạng thái khiếu nại"
        >
          <option value="all">Tất cả</option>
          <option value="open">{INCIDENT_STATUS_LABELS.open}</option>
          <option value="in_progress">{INCIDENT_STATUS_LABELS.in_progress}</option>
          <option value="resolved">{INCIDENT_STATUS_LABELS.resolved}</option>
        </NativeSelect>
      </Label>
    </div>
  )
}
