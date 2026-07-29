import { ArrowLeft, Banknote, CarFront, Check, CheckCircle2, QrCode, ShieldCheck } from 'lucide-react'
import type { GateSession } from '../../../services/staffGateApi'
import { cn } from '../../../lib/utils'
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
  const tone = isCash ? 'amber' : requiresPayment ? 'sky' : 'emerald'
  const title = isCash
    ? 'Xác nhận đã nhận đủ tiền mặt'
    : requiresPayment
      ? 'Tạo mã thanh toán chuyển khoản'
      : 'Xác nhận phương tiện rời bãi'

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="gap-0 overflow-hidden rounded-3xl p-0 shadow-2xl sm:max-w-2xl">
        <DialogHeader className={cn(
          'relative overflow-hidden border-b p-6 pr-14 text-left md:p-8 md:pr-16',
          tone === 'amber' && 'border-amber-500/20 bg-linear-to-br from-amber-500/20 via-background to-orange-500/10',
          tone === 'sky' && 'border-sky-500/20 bg-linear-to-br from-sky-500/20 via-background to-cyan-500/10',
          tone === 'emerald' && 'border-emerald-500/20 bg-linear-to-br from-emerald-500/20 via-background to-teal-500/10',
        )}>
          <div className="flex items-start gap-4">
            <span className={cn(
              'flex size-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-lg',
              tone === 'amber' && 'bg-amber-600 shadow-amber-500/25',
              tone === 'sky' && 'bg-sky-600 shadow-sky-500/25',
              tone === 'emerald' && 'bg-emerald-600 shadow-emerald-500/25',
            )}>
              {isCash ? <Banknote className="size-6" /> : requiresPayment ? <QrCode className="size-6" /> : <CheckCircle2 className="size-6" />}
            </span>
            <div>
              <p className={cn(
                'text-xs font-bold uppercase tracking-[0.18em]',
                tone === 'amber' && 'text-amber-700 dark:text-amber-300',
                tone === 'sky' && 'text-sky-700 dark:text-sky-300',
                tone === 'emerald' && 'text-emerald-700 dark:text-emerald-300',
              )}>
                Xác nhận trước khi trả xe
              </p>
              <DialogTitle className="mt-2 text-2xl font-bold">{title}</DialogTitle>
              <DialogDescription className="mt-2 leading-6">
                Kiểm tra lần cuối biển số và trạng thái thanh toán trước khi mở cổng.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-4 p-6 md:grid-cols-2 md:p-8">
          <div className="rounded-2xl border border-sky-500/20 bg-linear-to-br from-sky-500/10 to-transparent p-5">
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-sky-700 dark:text-sky-300">
              <CarFront className="size-4" /> Biển số xe
            </p>
            <p className="mt-3 wrap-break-word text-3xl font-black tracking-widest">{session.licensePlate}</p>
          </div>

          <div className={cn(
            'rounded-2xl border p-5',
            tone === 'amber' && 'border-amber-500/25 bg-amber-500/10',
            tone === 'sky' && 'border-sky-500/25 bg-sky-500/10',
            tone === 'emerald' && 'border-emerald-500/25 bg-emerald-500/10',
          )}>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              {requiresPayment ? <Banknote className="size-4" /> : <ShieldCheck className="size-4" />}
              {requiresPayment ? 'Số tiền cần thu' : 'Thanh toán'}
            </p>
            <p className="mt-3 text-3xl font-black">
              {requiresPayment ? formatStaffCurrency(amount) : 'Không cần thu thêm'}
            </p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {isCash
                ? 'Chỉ xác nhận sau khi đã nhận và kiểm đếm đủ tiền.'
                : requiresPayment
                  ? 'Hệ thống sẽ tạo mã QR để khách thanh toán.'
                  : 'Xe đã hoàn tất nghĩa vụ thanh toán.'}
            </p>
          </div>

          <div className="rounded-2xl border bg-muted/25 p-4 md:col-span-2">
            <p className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
              <span className={cn(
                'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-white',
                tone === 'amber' && 'bg-amber-600',
                tone === 'sky' && 'bg-sky-600',
                tone === 'emerald' && 'bg-emerald-600',
              )}>
                <Check className="size-3.5" />
              </span>
              {isCash
                ? 'Nhân viên chịu trách nhiệm kiểm đếm đủ số tiền trước khi xác nhận mở cổng.'
                : requiresPayment
                  ? 'Sau khi tạo mã, chỉ cho xe ra khi hệ thống ghi nhận thanh toán thành công.'
                  : 'QR đã được xác minh và phiên gửi không còn khoản phí cần thanh toán.'}
            </p>
          </div>
        </div>

        <DialogFooter className="m-0 rounded-none px-6 py-4 md:px-8">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="h-11 rounded-xl px-5">
            <ArrowLeft className="size-4" />
            Quay lại kiểm tra
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={cn(
              'h-11 rounded-xl px-6 font-bold text-white shadow-lg',
              tone === 'amber' && 'bg-amber-600 shadow-amber-500/20 hover:bg-amber-700',
              tone === 'sky' && 'bg-sky-600 shadow-sky-500/20 hover:bg-sky-700',
              tone === 'emerald' && 'bg-emerald-600 shadow-emerald-500/20 hover:bg-emerald-700',
            )}
          >
            {!isSubmitting && <Check className="size-4" />}
            {isSubmitting ? 'Đang xử lý...' : isCash ? 'Đã nhận tiền, cho xe ra' : requiresPayment ? 'Tạo mã thanh toán' : 'Xác nhận cho xe ra'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
