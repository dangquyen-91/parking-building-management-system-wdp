import { Button } from '@/components/ui/button'
import { useRef } from 'react'
import { useFocusTrap } from '../../../hooks/useFocusTrap'
import { useLockBodyScroll } from '../../../hooks/useLockBodyScroll'
import type { ManagerPlan } from '../../../services/managerPlansApi'
import { OverlayBackdrop } from '../../common'

type ManagerPlanDeleteDialogProps = {
  plan: ManagerPlan | null
  isDeleting: boolean
  error?: string | null
  onClose: () => void
  onConfirm: () => void
}

export function ManagerPlanDeleteDialog({
  plan,
  isDeleting,
  error,
  onClose,
  onConfirm,
}: ManagerPlanDeleteDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const open = plan !== null

  useLockBodyScroll(open)
  useFocusTrap(open, dialogRef, onClose)

  if (!plan) return null

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <OverlayBackdrop
        onClose={onClose}
        label="Đóng hộp xác nhận xóa gói"
        className="fixed inset-0 z-40 bg-overlay/80 backdrop-blur-[2px]"
      />
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-plan-dialog-title"
        className="relative z-50 w-full max-w-md overflow-hidden rounded-3xl border border-border bg-background shadow-2xl"
      >
        <div className="border-b border-border bg-gradient-to-r from-rose-500/15 via-transparent to-transparent p-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-rose-600 dark:text-rose-300">
            Xác nhận xóa
          </p>
          <h2 id="delete-plan-dialog-title" className="mt-2 text-2xl font-black text-foreground">
            Xóa gói {plan.name}?
          </h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Gói sẽ bị xóa khỏi hệ thống. Nếu đang có đăng ký chờ thanh toán hoặc đang hiệu lực, hệ thống sẽ
            từ chối và bạn nên tạm dừng gói thay vì xóa.
          </p>
          {error && (
            <div className="mt-4 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-700 dark:text-rose-200">
              {error}
            </div>
          )}
        </div>
        <div className="flex flex-col-reverse gap-3 p-5 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
            Hủy
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? 'Đang xóa...' : 'Xóa gói'}
          </Button>
        </div>
      </div>
    </div>
  )
}
