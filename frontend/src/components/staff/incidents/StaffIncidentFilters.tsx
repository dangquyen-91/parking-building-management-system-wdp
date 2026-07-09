import type { ComplaintStatus } from '../../../services/complaintsApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Label } from '../../ui/label'
import { NativeSelect } from '../../ui/native-select'
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
    <Card className="mb-5">
      <CardHeader>
        <CardTitle>Bộ lọc xử lý</CardTitle>
        <CardDescription>Chọn nhóm khiếu nại cần ưu tiên trong ca trực.</CardDescription>
      </CardHeader>
      <CardContent>
        <Label className="grid max-w-xs gap-2 text-xs text-muted-foreground">
          Trạng thái
          <NativeSelect
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as IncidentFilter)}
            aria-label="Lọc trạng thái khiếu nại"
          >
            {FILTER_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </NativeSelect>
        </Label>
      </CardContent>
    </Card>
  )
}
