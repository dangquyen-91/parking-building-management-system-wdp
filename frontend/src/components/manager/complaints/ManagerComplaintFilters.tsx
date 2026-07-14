import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'
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
    <div className="grid w-full min-w-0 gap-3 sm:grid-cols-2 xl:w-auto xl:min-w-[32rem]">
      <Label className="grid min-w-0 gap-2 text-xs font-medium text-muted-foreground">
        Tìm biển số
        <Input
          className="h-10"
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
          onChange={(event) => onStatusFilterChange(event.target.value as ManagerComplaintStatusFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="open">{MANAGER_COMPLAINT_STATUS_LABELS.open}</option>
          <option value="in_progress">{MANAGER_COMPLAINT_STATUS_LABELS.in_progress}</option>
          <option value="resolved">{MANAGER_COMPLAINT_STATUS_LABELS.resolved}</option>
        </NativeSelect>
      </Label>
    </div>
  )
}
