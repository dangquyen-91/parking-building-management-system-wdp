import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect } from '@/components/ui/native-select'

export type ManagerStaffStatusFilter = 'all' | 'active' | 'inactive'

type ManagerStaffFiltersProps = {
  query: string
  statusFilter: ManagerStaffStatusFilter
  onQueryChange: (value: string) => void
  onStatusFilterChange: (value: ManagerStaffStatusFilter) => void
}

export function ManagerStaffFilters({
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
}: ManagerStaffFiltersProps) {
  return (
    <div className="grid w-full gap-3 sm:grid-cols-2 xl:w-auto xl:min-w-[32rem]">
      <Label className="grid gap-1 text-xs text-muted-foreground">
        Tìm nhân viên
        <Input
          className="h-10"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Tên, email hoặc số điện thoại"
        />
      </Label>

      <Label className="grid gap-1 text-xs text-muted-foreground">
        Trạng thái tài khoản
        <NativeSelect
          className="w-full"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as ManagerStaffStatusFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </NativeSelect>
      </Label>
    </div>
  )
}
