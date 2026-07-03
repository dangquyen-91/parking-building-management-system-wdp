import { formatStaffCurrency } from '../data/staffGateUi'

type CheckoutMethod = 'cash' | 'transfer'

type StaffGateCheckoutActionsProps = {
  amountToCollect: number
  isSubmitting: boolean
  isPreviewLoading: boolean
  checkoutVerified: boolean
  onSelectMethod: (method: CheckoutMethod) => void
}

export function StaffGateCheckoutActions({
  amountToCollect,
  isSubmitting,
  isPreviewLoading,
  checkoutVerified,
  onSelectMethod,
}: StaffGateCheckoutActionsProps) {
  return (
    <div className={`grid gap-3 border-t border-theme p-4 ${amountToCollect > 0 ? 'sm:grid-cols-2' : ''}`}>
      {amountToCollect > 0 && (
        <button
          type="button"
          onClick={() => onSelectMethod('cash')}
          disabled={isSubmitting || isPreviewLoading || !checkoutVerified}
          className="h-14 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
        >
          Thu tiền mặt {formatStaffCurrency(amountToCollect)}
        </button>
      )}
      <button
        type="button"
        onClick={() => onSelectMethod('transfer')}
        disabled={isSubmitting || isPreviewLoading || !checkoutVerified}
        className="h-14 rounded-xl border border-theme-strong bg-btn-primary px-4 text-sm font-bold text-btn-primary-fg shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {amountToCollect > 0 ? `Chuyển khoản ${formatStaffCurrency(amountToCollect)}` : 'Xác nhận xe ra'}
      </button>
      {!checkoutVerified && (
        <p className="text-center text-[11px] font-medium text-amber-600 dark:text-amber-300 sm:col-span-2">
          Cần quét đúng QR và khớp biển số camera trước khi thanh toán và cho xe ra.
        </p>
      )}
    </div>
  )
}

export type { CheckoutMethod }
