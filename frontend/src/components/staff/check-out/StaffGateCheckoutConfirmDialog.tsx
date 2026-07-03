import type { GateSession } from '../../../services/staffGateApi'
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
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-confirm-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-theme bg-page shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={[
          'border-b border-theme p-5',
          isCash ? 'bg-gradient-to-r from-emerald-500/20 to-transparent' : 'bg-gradient-to-r from-sky-500/20 to-transparent',
        ].join(' ')}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-subtle">Xác nhận trước khi trả xe</p>
          <h3 id="checkout-confirm-title" className="mt-2 text-xl font-bold text-fg">
            {isCash ? 'Đã nhận đủ tiền mặt?' : requiresPayment ? 'Tạo thanh toán chuyển khoản?' : 'Xác nhận cho xe ra?'}
          </h3>
          <p className="mt-1 text-sm text-muted">Kiểm tra kỹ biển số và thanh toán trước khi mở cổng.</p>
        </div>

        <div className="grid gap-4 p-5">
          <div className="rounded-xl border border-theme bg-badge p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-subtle">Biển số xe</p>
            <p className="mt-1 text-2xl font-black tracking-[0.1em] text-fg">{session.licensePlate}</p>
          </div>

          <div className={[
            'rounded-xl border p-4',
            isCash && requiresPayment
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : 'border-theme bg-badge',
          ].join(' ')}>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-subtle">
              {requiresPayment ? 'Số tiền cần thu' : 'Thanh toán'}
            </p>
            <p className="mt-1 text-2xl font-black text-fg">
              {requiresPayment ? formatStaffCurrency(amount) : 'Không cần thu thêm'}
            </p>
            <p className="mt-1 text-xs text-muted">
              {isCash
                ? 'Chỉ xác nhận sau khi đã nhận và kiểm đếm đủ tiền.'
                : requiresPayment
                  ? 'Hệ thống sẽ tạo mã QR để khách thanh toán.'
                  : 'Xe đã hoàn tất nghĩa vụ thanh toán.'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 border-t border-theme p-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-12 rounded-xl border border-theme bg-badge px-4 text-sm font-semibold text-fg hover:bg-ghost disabled:opacity-60"
          >
            Quay lại kiểm tra
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={[
              'h-12 rounded-xl px-4 text-sm font-bold text-white shadow-lg disabled:opacity-60',
              isCash ? 'bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-500' : 'bg-sky-600 shadow-sky-600/20 hover:bg-sky-500',
            ].join(' ')}
          >
            {isSubmitting ? 'Đang xử lý...' : isCash ? 'Đã nhận tiền, cho xe ra' : requiresPayment ? 'Tạo mã thanh toán' : 'Xác nhận cho xe ra'}
          </button>
        </div>
      </div>
    </div>
  )
}
