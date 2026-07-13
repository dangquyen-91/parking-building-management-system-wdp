import type { GateSession } from '../../../services/staffGateApi'
import { Button } from '../../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import { formatStaffCurrency } from '../data/staffGateUi'
import type { CheckoutMethod } from './StaffGateCheckoutActions'

type StaffGateCheckoutConfirmDialogProps = {
  session: GateSession
  method: CheckoutMethod
  amount: number
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function StaffGateCheckoutConfirmDialog({
  session,
  method,
  amount,
  isSubmitting,
  onCancel,
  onConfirm,
}: StaffGateCheckoutConfirmDialogProps) {
  const isCash = method === 'cash'
  const requiresPayment = amount > 0

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogDescription>Xác nhận trước khi trả xe</DialogDescription>
          <DialogTitle>
            {isCash ? 'Đã nhận đủ tiền mặt?' : requiresPayment ? 'Tạo thanh toán chuyển khoản?' : 'Xác nhận cho xe ra?'}
          </DialogTitle>
          <DialogDescription>
            Kiểm tra kỹ biển số và thanh toán trước khi mở cổng.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">Biển số xe</p>
            <p className="mt-1 text-2xl font-bold tracking-[0.1em]">{session.licensePlate}</p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground">
              {requiresPayment ? 'Số tiền cần thu' : 'Thanh toán'}
            </p>
            <p className="mt-1 text-2xl font-bold">
              {requiresPayment ? formatStaffCurrency(amount) : 'Không cần thu thêm'}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {isCash
                ? 'Chỉ xác nhận sau khi đã nhận và kiểm đếm đủ tiền.'
                : requiresPayment
                  ? 'Hệ thống sẽ tạo mã QR để khách thanh toán.'
                  : 'Xe đã hoàn tất nghĩa vụ thanh toán.'}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Quay lại kiểm tra
          </Button>
          <Button type="button" onClick={onConfirm} disabled={isSubmitting}>
            {isSubmitting ? 'Đang xử lý...' : isCash ? 'Đã nhận tiền, cho xe ra' : requiresPayment ? 'Tạo mã thanh toán' : 'Xác nhận cho xe ra'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
