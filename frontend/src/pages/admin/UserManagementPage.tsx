import { useEffect, useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import {
  AdminPageShell,
  AdminStatCard,
  AdminStatusBadge,
  AdminTableShell,
  AdminUserRoleDialog,
} from '../../components/admin'
import { adminApi, type AdminUser } from '../../services/adminApi'
import { getStoredAuthUser } from '../../services/authApi'
import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent } from '../../components/ui/card'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { NativeSelect, NativeSelectOption } from '../../components/ui/native-select'
import { Skeleton } from '../../components/ui/skeleton'
import { TableCell, TableRow } from '../../components/ui/table'

const roleLabels: Record<AdminUser['role'], string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  staff: 'Nhân viên',
  user: 'Người dùng',
}

export function UserManagementPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<'all' | AdminUser['role']>('all')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const currentUserId = getStoredAuthUser()?._id

  useEffect(() => {
    let ignore = false

    async function load() {
      try {
        setIsLoading(true)
        setError('')
        const response = await adminApi.getUsers({
          limit: 100,
          sort: 'createdAt',
          order: 'desc',
        })

        if (!ignore) {
          setUsers(response.users ?? [])
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : 'Không thể tải danh sách người dùng.')
        }
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    void load()
    return () => {
      ignore = true
    }
  }, [])

  const roles = useMemo(
    () =>
      (['admin', 'manager', 'staff', 'user'] as const).map((role) => ({
        role,
        users: users.filter((user) => user.role === role).length,
      })),
    [users],
  )

  const filteredUsers = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return users.filter((user) => {
      const matchesQuery =
        !normalizedQuery ||
        user.fullName.toLowerCase().includes(normalizedQuery) ||
        user.email.toLowerCase().includes(normalizedQuery) ||
        Boolean(user.phone?.toLowerCase().includes(normalizedQuery))
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      const matchesStatus =
        statusFilter === 'all' || user.isActive === (statusFilter === 'active')

      return matchesQuery && matchesRole && matchesStatus
    })
  }, [query, roleFilter, statusFilter, users])

  const activeUsers = filteredUsers.filter((user) => user.isActive).length
  const operations = filteredUsers.filter(
    (user) => user.role === 'manager' || user.role === 'staff',
  ).length

  function handleRoleUpdated(updatedUser: AdminUser) {
    setUsers((items) =>
      items.map((user) => (user._id === updatedUser._id ? updatedUser : user)),
    )
  }

  return (
    <AdminPageShell
      eyebrow="Admin // Người dùng"
      title="Quản lý người dùng"
      description="Quản lý tài khoản, trạng thái và vai trò truy cập của người dùng trong hệ thống."
      actions={
        <Card className="w-full xl:min-w-[44rem]">
          <CardContent className="grid gap-3 p-4 sm:grid-cols-3">
            <Label className="grid gap-2">
              <span>Tìm kiếm</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  className="pl-9"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Tên, email hoặc số điện thoại"
                />
              </div>
            </Label>
            <Label className="grid gap-2">
              <span>Vai trò</span>
              <NativeSelect
                value={roleFilter}
                onChange={(event) =>
                  setRoleFilter(event.target.value as typeof roleFilter)
                }
              >
                <NativeSelectOption value="all">Tất cả vai trò</NativeSelectOption>
                {roles.map(({ role }) => (
                  <NativeSelectOption key={role} value={role}>
                    {roleLabels[role]}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </Label>
            <Label className="grid gap-2">
              <span>Trạng thái</span>
              <NativeSelect
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as typeof statusFilter)
                }
              >
                <NativeSelectOption value="all">Tất cả</NativeSelectOption>
                <NativeSelectOption value="active">Đang hoạt động</NativeSelectOption>
                <NativeSelectOption value="inactive">Đã khóa</NativeSelectOption>
              </NativeSelect>
            </Label>
          </CardContent>
        </Card>
      }
    >
      {error && (
        <Card className="mb-5 border-destructive/40">
          <CardContent className="p-4 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard
          label="Tất cả tài khoản"
          value={isLoading ? '-' : filteredUsers.length}
          detail="Theo bộ lọc hiện tại"
          tone="violet"
        />
        <AdminStatCard
          label="Đội vận hành"
          value={isLoading ? '-' : operations}
          detail="Quản lý và nhân viên trong kết quả"
          tone="sky"
        />
        <AdminStatCard
          label="Đang hoạt động"
          value={isLoading ? '-' : activeUsers}
          detail="Đang hoạt động trong kết quả"
          tone="emerald"
        />
      </div>

      <div className="mt-5">
        {isLoading ? (
          <Card>
            <CardContent className="space-y-3 p-5">
              {Array.from({ length: 6 }, (_, index) => (
                <Skeleton key={index} className="h-14 w-full" />
              ))}
            </CardContent>
          </Card>
        ) : filteredUsers.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-10 text-center text-sm text-muted-foreground">
              Không tìm thấy người dùng.
            </CardContent>
          </Card>
        ) : (
          <AdminTableShell
            eyebrow="Tài khoản hệ thống"
            title="Danh sách người dùng"
            countLabel={`${filteredUsers.length} tài khoản`}
            minWidth="1040px"
            columns={[
              { label: 'Người dùng', className: 'w-[25%]' },
              { label: 'Vai trò', className: 'w-[14%]' },
              { label: 'Điện thoại', className: 'w-[15%]' },
              { label: 'Ngày tạo', className: 'w-[20%]' },
              { label: 'Trạng thái', className: 'w-[14%]' },
              { label: 'Thao tác', className: 'w-[12%] text-right' },
            ]}
          >
            {filteredUsers.map((user) => {
              const isCurrentUser = user._id === currentUserId

              return (
                <TableRow key={user._id}>
                  <TableCell className="px-4 py-4">
                    <p className="font-bold text-foreground">{user.fullName}</p>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{user.email}</p>
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <Badge variant="outline">{roleLabels[user.role]}</Badge>
                  </TableCell>
                  <TableCell className="px-4 py-4">{user.phone ?? '-'}</TableCell>
                  <TableCell className="px-4 py-4">
                    {formatDateTime(user.createdAt)}
                  </TableCell>
                  <TableCell className="px-4 py-4">
                    <AdminStatusBadge status={user.isActive ? 'active' : 'inactive'} />
                  </TableCell>
                  <TableCell className="px-4 py-4 text-right">
                    <AdminUserRoleDialog
                      user={user}
                      disabled={isCurrentUser}
                      onUpdated={handleRoleUpdated}
                      trigger={
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isCurrentUser}
                          title={
                            isCurrentUser
                              ? 'Không thể thay đổi vai trò của chính mình'
                              : 'Thay đổi vai trò'
                          }
                        >
                          Phân quyền
                        </Button>
                      }
                    />
                  </TableCell>
                </TableRow>
              )
            })}
          </AdminTableShell>
        )}

      </div>
    </AdminPageShell>
  )
}

function formatDateTime(value?: string) {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleString('vi-VN')
}
