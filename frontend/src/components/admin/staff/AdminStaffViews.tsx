import { Search, UserRound } from 'lucide-react'
import type { AdminUser } from '../../../services/adminApi'
import type { GateSession } from '../../../services/staffGateApi'
import { Card, CardContent } from '../../ui/card'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { NativeSelect, NativeSelectOption } from '../../ui/native-select'
import { Skeleton } from '../../ui/skeleton'
import { TableCell, TableRow } from '../../ui/table'
import { AdminStatCard } from '../common/AdminStatCard'
import { AdminStatusBadge } from '../common/AdminStatusBadge'
import { AdminTableShell } from '../common/AdminTableShell'

export type AdminStaffStatusFilter = 'all' | 'active' | 'inactive'
function staffIdFromSession(session: GateSession) { return typeof session.staffId === 'string' ? session.staffId : session.staffId?._id }
function sessionsForStaff(user: AdminUser, sessions: GateSession[]) { return sessions.filter((session) => staffIdFromSession(session) === user._id) }

export function AdminStaffFilters({ query, statusFilter, onQueryChange, onStatusFilterChange }: { query: string; statusFilter: AdminStaffStatusFilter; onQueryChange: (value: string) => void; onStatusFilterChange: (value: AdminStaffStatusFilter) => void }) {
  return <Card className="w-full xl:min-w-[34rem]"><CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_12rem]"><Label className="grid gap-2 text-xs text-muted-foreground">Tìm nhân viên<div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={query} onChange={(e) => onQueryChange(e.target.value)} placeholder="Tên, email hoặc số điện thoại" /></div></Label><Label className="grid gap-2 text-xs text-muted-foreground">Trạng thái<NativeSelect value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value as AdminStaffStatusFilter)}><NativeSelectOption value="all">Tất cả</NativeSelectOption><NativeSelectOption value="active">Đang hoạt động</NativeSelectOption><NativeSelectOption value="inactive">Đã khóa</NativeSelectOption></NativeSelect></Label></CardContent></Card>
}

export function AdminStaffStats({ staff, sessions, isLoading }: { staff: AdminUser[]; sessions: GateSession[]; isLoading: boolean }) {
  const active = staff.filter((user) => user.isActive).length; const handling = new Set(sessions.map(staffIdFromSession).filter(Boolean)).size
  return <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><AdminStatCard label="Tổng nhân viên" value={isLoading ? '-' : staff.length} detail="Tài khoản có vai trò staff" /><AdminStatCard label="Đang hoạt động" value={isLoading ? '-' : active} detail={`${staff.length - active} tài khoản đã khóa`} tone="emerald" /><AdminStatCard label="Đang phụ trách" value={isLoading ? '-' : handling} detail="Có phiên gửi xe hoạt động" tone="sky" /><AdminStatCard label="Xe đang theo dõi" value={isLoading ? '-' : sessions.length} detail="Tổng phiên chưa checkout" tone="amber" /></div>
}

export function AdminStaffList({ staff, sessions, isLoading }: { staff: AdminUser[]; sessions: GateSession[]; isLoading: boolean }) {
  if (isLoading) return <div className="grid gap-3">{Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-16 rounded-xl" />)}</div>
  if (!staff.length) return <Card className="border-dashed"><CardContent className="p-10 text-center text-sm text-muted-foreground">Không có nhân viên phù hợp.</CardContent></Card>
  return <AdminTableShell eyebrow="Đội ngũ vận hành" title="Danh sách nhân viên" countLabel={`${staff.length} nhân viên`} minWidth="980px" columns={[{ label: 'Nhân viên', className: 'w-[27%]' }, { label: 'Liên hệ', className: 'w-[23%]' }, { label: 'Trạng thái', className: 'w-[18%]' }, { label: 'Xe phụ trách', className: 'w-[14%]' }, { label: 'Biển số theo dõi', className: 'w-[18%]' }]}>{staff.map((user) => { const staffSessions = sessionsForStaff(user, sessions); return <TableRow key={user._id}><TableCell className="px-4 py-4"><div className="flex items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><UserRound className="size-4" /></span><div className="min-w-0"><p className="truncate font-bold">{user.fullName}</p><p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p></div></div></TableCell><TableCell className="px-4 py-4"><p>{user.phone || 'Chưa cập nhật'}</p><p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p></TableCell><TableCell className="px-4 py-4"><AdminStatusBadge status={user.isActive ? 'active' : 'inactive'} /></TableCell><TableCell className="px-4 py-4 font-bold">{staffSessions.length} xe</TableCell><TableCell className="px-4 py-4"><p className="truncate text-xs font-semibold" title={staffSessions.map((session) => session.licensePlate).join(', ')}>{staffSessions.length ? staffSessions.map((session) => session.licensePlate).join(', ') : 'Chưa có xe'}</p></TableCell></TableRow> })}</AdminTableShell>
}
