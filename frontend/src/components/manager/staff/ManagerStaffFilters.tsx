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
      <label className="grid gap-1 text-xs font-medium text-subtle">
        Tìm nhân viên
        <input
          className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg outline-none focus:border-btn-primary"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Tên, email hoặc số điện thoại"
        />
      </label>

      <label className="grid gap-1 text-xs font-medium text-subtle">
        Trạng thái tài khoản
        <select
          className="h-10 rounded-lg border border-theme bg-page px-3 text-sm text-fg"
          value={statusFilter}
          onChange={(event) => onStatusFilterChange(event.target.value as ManagerStaffStatusFilter)}
        >
          <option value="all">Tất cả</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Đã khóa</option>
        </select>
      </label>
    </div>
  )
}
