import { useState, type ReactNode } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import type { AuthRole } from '@/services/authApi'
import { adminApi, type AdminUser } from '@/services/adminApi'

const roleLabels: Record<AuthRole, string> = {
  admin: 'Quản trị viên',
  manager: 'Quản lý',
  staff: 'Nhân viên',
  user: 'Người dùng',
}

const roleDescriptions: Record<AuthRole, string> = {
  admin: 'Toàn quyền quản trị và phân quyền hệ thống.',
  manager: 'Quản lý bãi xe, nhân viên và báo cáo.',
  staff: 'Vận hành cổng và xử lý xe vào, xe ra.',
  user: 'Đặt chỗ và sử dụng các gói gửi xe.',
}

type AdminUserRoleDialogProps = {
  user: AdminUser
  disabled?: boolean
  trigger: ReactNode
  onUpdated: (user: AdminUser) => void
}

export function AdminUserRoleDialog({
  user,
  disabled = false,
  trigger,
  onUpdated,
}: AdminUserRoleDialogProps) {
  const [open, setOpen] = useState(false)
  const [role, setRole] = useState<AuthRole>(user.role)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  function handleOpenChange(nextOpen: boolean) {
    setOpen(nextOpen)
    if (nextOpen) {
      setRole(user.role)
      setError('')
    }
  }

  async function handleSubmit() {
    if (role === user.role) {
      setOpen(false)
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      const response = await adminApi.changeUserRole(user._id, role)
      onUpdated(response.user)
      setOpen(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : ''
      setError(
        message.includes('Cannot change your own role')
          ? 'Bạn không thể thay đổi vai trò của chính mình.'
          : message || 'Không thể cập nhật vai trò. Vui lòng thử lại.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild disabled={disabled}>
        {trigger}
      </DialogTrigger>
      <DialogContent className="p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border bg-gradient-to-br from-violet-500/10 via-transparent to-sky-500/10 p-6 pr-12">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-violet-600 dark:text-violet-300">
            Phân quyền tài khoản
          </p>
          <DialogTitle className="text-2xl font-black text-foreground">
            {user.fullName}
          </DialogTitle>
          <DialogDescription>
            Chọn quyền truy cập phù hợp cho tài khoản {user.email}.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 p-6">
          <div className="rounded-2xl border border-border bg-muted/35 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
              Vai trò hiện tại
            </p>
            <p className="mt-2 font-bold text-foreground">
              {roleLabels[user.role]}
            </p>
          </div>

          <Label className="grid gap-2">
            <span>Vai trò mới</span>
            <NativeSelect
              value={role}
              onChange={(event) => setRole(event.target.value as AuthRole)}
            >
              {(Object.keys(roleLabels) as AuthRole[]).map((value) => (
                <NativeSelectOption key={value} value={value}>
                  {roleLabels[value]}
                </NativeSelectOption>
              ))}
            </NativeSelect>
          </Label>

          <div className="rounded-2xl border border-sky-500/25 bg-sky-500/10 p-4 text-sm text-foreground">
            <p className="font-bold">{roleLabels[role]}</p>
            <p className="mt-1 leading-6 text-muted-foreground">
              {roleDescriptions[role]}
            </p>
          </div>

          {error && (
            <p className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm font-medium text-destructive">
              {error}
            </p>
          )}
        </div>

        <DialogFooter className="m-0 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
          >
            Hủy
          </Button>
          <Button
            type="button"
            disabled={isSubmitting || role === user.role}
            onClick={() => void handleSubmit()}
          >
            {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật vai trò'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
