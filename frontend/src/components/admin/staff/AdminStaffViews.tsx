import { Search, UserRound } from 'lucide-react'
import type { AdminUser } from '../../../services/adminApi'
import type { GateSession } from '../../../services/staffGateApi'
import { AdminStatCard } from '../common/AdminStatCard'
import { AdminStatusBadge } from '../common/AdminStatusBadge'
import { Badge } from '../../ui/badge'
import { Card, CardContent, CardHeader } from '../../ui/card'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { NativeSelect, NativeSelectOption } from '../../ui/native-select'
import { Skeleton } from '../../ui/skeleton'

export type AdminStaffStatusFilter = 'all' | 'active' | 'inactive'

export function AdminStaffFilters({ query, statusFilter, onQueryChange, onStatusFilterChange }: { query: string; statusFilter: AdminStaffStatusFilter; onQueryChange: (value: string) => void; onStatusFilterChange: (value: AdminStaffStatusFilter) => void }) {
  return <Card className="w-full xl:min-w-[34rem]"><CardContent className="grid gap-3 p-4 sm:grid-cols-2">
    <Label className="grid gap-2"><span>Tìm nhân viên</span><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Tên, email hoặc số điện thoại" /></div></Label>
    <Label className="grid gap-2"><span>Trạng thái</span><NativeSelect value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as AdminStaffStatusFilter)}><NativeSelectOption value="all">Tất cả</NativeSelectOption><NativeSelectOption value="active">Đang hoạt động</NativeSelectOption><NativeSelectOption value="inactive">Đã khóa</NativeSelectOption></NativeSelect></Label>
  </CardContent></Card>
}

export function AdminStaffStats({ staff, sessions, isLoading }: { staff: AdminUser[]; sessions: GateSession[]; isLoading: boolean }) {
  const active = staff.filter((user) => user.isActive).length
  const handling = new Set(sessions.map((s) => typeof s.staffId === 'string' ? s.staffId : s.staffId?._id).filter(Boolean)).size
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><AdminStatCard label="Tổng nhân viên" value={isLoading ? '-' : staff.length} detail="Tài khoản có vai trò staff" /><AdminStatCard label="Đang hoạt động" value={isLoading ? '-' : active} detail={`${staff.length - active} tài khoản đã khóa`} tone="emerald" /><AdminStatCard label="Đang phụ trách" value={isLoading ? '-' : handling} detail="Có phiên gửi xe hoạt động" tone="sky" /><AdminStatCard label="Xe đang theo dõi" value={isLoading ? '-' : sessions.length} detail="Tổng phiên chưa checkout" tone="amber" /></div>
}

export function AdminStaffList({ staff, sessions, isLoading }: { staff: AdminUser[]; sessions: GateSession[]; isLoading: boolean }) {
  if (isLoading) return <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-64 rounded-xl" />)}</div>
  if (!staff.length) return <Card className="border-dashed"><CardContent className="p-10 text-center text-sm text-muted-foreground">Không có nhân viên phù hợp.</CardContent></Card>
  return <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{staff.map((user) => {
    const staffSessions = sessions.filter((s) => (typeof s.staffId === 'string' ? s.staffId : s.staffId?._id) === user._id)
    return <Card key={user._id} className="transition-shadow hover:shadow-md"><CardHeader className="flex-row items-start justify-between"><div className="flex min-w-0 items-center gap-3"><span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><UserRound className="size-5" /></span><div className="min-w-0"><p className="truncate font-semibold">{user.fullName}</p><p className="truncate text-xs text-muted-foreground">{user.email}</p></div></div><AdminStatusBadge status={user.isActive ? 'active' : 'inactive'} /></CardHeader><CardContent><dl className="grid grid-cols-2 gap-4 text-sm"><div><dt className="text-xs text-muted-foreground">Số điện thoại</dt><dd className="mt-1 font-medium">{user.phone || 'Chưa cập nhật'}</dd></div><div><dt className="text-xs text-muted-foreground">Xe phụ trách</dt><dd className="mt-1 font-medium">{staffSessions.length}</dd></div></dl>{staffSessions.length > 0 && <div className="mt-4 flex flex-wrap gap-2 border-t pt-4">{staffSessions.slice(0, 5).map((s) => <Badge key={s._id} variant="secondary">{s.licensePlate}</Badge>)}</div>}</CardContent></Card>
  })}</section>
}
