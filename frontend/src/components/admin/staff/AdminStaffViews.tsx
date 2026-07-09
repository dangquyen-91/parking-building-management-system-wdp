import { Mail, Phone, Search, UserRound } from 'lucide-react'
import type { AdminUser } from '../../../services/adminApi'
import type { GateSession } from '../../../services/staffGateApi'
import { AdminStatCard } from '../common/AdminStatCard'
import { AdminStatusBadge } from '../common/AdminStatusBadge'
import { Badge } from '../../ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../../ui/card'
import { Input } from '../../ui/input'
import { Label } from '../../ui/label'
import { NativeSelect, NativeSelectOption } from '../../ui/native-select'
import { Skeleton } from '../../ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../ui/table'

export type AdminStaffStatusFilter = 'all' | 'active' | 'inactive'

function staffIdFromSession(session: GateSession) {
  return typeof session.staffId === 'string' ? session.staffId : session.staffId?._id
}

function sessionsForStaff(user: AdminUser, sessions: GateSession[]) {
  return sessions.filter((session) => staffIdFromSession(session) === user._id)
}

export function AdminStaffFilters({
  query,
  statusFilter,
  onQueryChange,
  onStatusFilterChange,
}: {
  query: string
  statusFilter: AdminStaffStatusFilter
  onQueryChange: (value: string) => void
  onStatusFilterChange: (value: AdminStaffStatusFilter) => void
}) {
  return (
    <Card className="w-full xl:min-w-[34rem]">
      <CardContent className="grid gap-3 p-4 sm:grid-cols-[1fr_12rem]">
        <Label className="grid gap-2 text-xs text-muted-foreground">
          Tìm nhân viên
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-9"
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Tên, email hoặc số điện thoại"
            />
          </div>
        </Label>
        <Label className="grid gap-2 text-xs text-muted-foreground">
          Trạng thái
          <NativeSelect
            value={statusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as AdminStaffStatusFilter)}
          >
            <NativeSelectOption value="all">Tất cả</NativeSelectOption>
            <NativeSelectOption value="active">Đang hoạt động</NativeSelectOption>
            <NativeSelectOption value="inactive">Đã khóa</NativeSelectOption>
          </NativeSelect>
        </Label>
      </CardContent>
    </Card>
  )
}

export function AdminStaffStats({
  staff,
  sessions,
  isLoading,
}: {
  staff: AdminUser[]
  sessions: GateSession[]
  isLoading: boolean
}) {
  const active = staff.filter((user) => user.isActive).length
  const handling = new Set(sessions.map(staffIdFromSession).filter(Boolean)).size

  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <AdminStatCard label="Tổng nhân viên" value={isLoading ? '-' : staff.length} detail="Tài khoản có vai trò staff" />
      <AdminStatCard label="Đang hoạt động" value={isLoading ? '-' : active} detail={`${staff.length - active} tài khoản đã khóa`} tone="emerald" />
      <AdminStatCard label="Đang phụ trách" value={isLoading ? '-' : handling} detail="Có phiên gửi xe hoạt động" tone="sky" />
      <AdminStatCard label="Xe đang theo dõi" value={isLoading ? '-' : sessions.length} detail="Tổng phiên chưa checkout" tone="amber" />
    </div>
  )
}

function AdminStaffCards({ staff, sessions }: { staff: AdminUser[]; sessions: GateSession[] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {staff.map((user) => {
        const staffSessions = sessionsForStaff(user, sessions)

        return (
          <Card key={user._id} className="transition-shadow hover:shadow-md">
            <CardHeader className="flex-row items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <UserRound className="size-5" />
                </span>
                <div className="min-w-0">
                  <CardTitle className="truncate">{user.fullName}</CardTitle>
                  <CardDescription className="truncate">{user.email}</CardDescription>
                </div>
              </div>
              <AdminStatusBadge status={user.isActive ? 'active' : 'inactive'} />
            </CardHeader>
            <CardContent className="space-y-4">
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Số điện thoại</dt>
                  <dd className="mt-1 font-medium">{user.phone || 'Chưa cập nhật'}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">Xe phụ trách</dt>
                  <dd className="mt-1 font-medium">{staffSessions.length}</dd>
                </div>
              </dl>
              {staffSessions.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t pt-4">
                  {staffSessions.slice(0, 5).map((session) => (
                    <Badge key={session._id} variant="secondary">
                      {session.licensePlate}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </section>
  )
}

function AdminStaffTable({ staff, sessions }: { staff: AdminUser[]; sessions: GateSession[] }) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nhân viên</TableHead>
            <TableHead>Liên hệ</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="text-right">Xe đang phụ trách</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {staff.map((user) => {
            const staffSessions = sessionsForStaff(user, sessions)

            return (
              <TableRow key={user._id}>
                <TableCell>
                  <div className="flex min-w-60 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                      <UserRound className="size-4" />
                    </span>
                    <div>
                      <p className="font-medium">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="grid gap-1 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <Mail className="size-3.5" />
                      {user.email}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="size-3.5" />
                      {user.phone || 'Chưa cập nhật'}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <AdminStatusBadge status={user.isActive ? 'active' : 'inactive'} />
                </TableCell>
                <TableCell className="text-right font-medium">{staffSessions.length}</TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </Card>
  )
}

export function AdminStaffList({
  staff,
  sessions,
  isLoading,
}: {
  staff: AdminUser[]
  sessions: GateSession[]
  isLoading: boolean
}) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="h-64 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!staff.length) {
    return (
      <Card className="border-dashed">
        <CardContent className="p-10 text-center text-sm text-muted-foreground">
          Không có nhân viên phù hợp.
        </CardContent>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="table" className="gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Danh sách nhân viên</h2>
          <p className="text-sm text-muted-foreground">
            {staff.length} nhân viên phù hợp với bộ lọc hiện tại.
          </p>
        </div>
        <TabsList>
          <TabsTrigger value="table">Bảng</TabsTrigger>
          <TabsTrigger value="cards">Thẻ</TabsTrigger>
        </TabsList>
      </div>
      <TabsContent value="table">
        <AdminStaffTable staff={staff} sessions={sessions} />
      </TabsContent>
      <TabsContent value="cards">
        <AdminStaffCards staff={staff} sessions={sessions} />
      </TabsContent>
    </Tabs>
  )
}
