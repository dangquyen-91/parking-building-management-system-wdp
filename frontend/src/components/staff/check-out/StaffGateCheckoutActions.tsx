import { Banknote, CreditCard } from 'lucide-react'
import { Button } from '../../ui/button'
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
    <div className={`grid gap-3 border-t bg-muted/20 p-4 ${amountToCollect > 0 ? 'sm:grid-cols-2' : ''}`}>
      {amountToCollect > 0 && (
        <Button
          type="button"
          variant="secondary"
          onClick={() => onSelectMethod('cash')}
          disabled={isSubmitting || isPreviewLoading || !checkoutVerified}
          className="h-12 rounded-xl border-amber-500/20 bg-amber-500/10 font-bold text-amber-800 hover:bg-amber-500/20 dark:text-amber-200"
        >
          <Banknote className="size-4" />
          Thu tiền mặt {formatStaffCurrency(amountToCollect)}
        </Button>
      )}
      <Button
        type="button"
        onClick={() => onSelectMethod('transfer')}
        disabled={isSubmitting || isPreviewLoading || !checkoutVerified}
        className="h-12 rounded-xl bg-emerald-600 font-bold text-white shadow-lg shadow-emerald-500/15 hover:bg-emerald-700"
      >
        <CreditCard className="size-4" />
        {amountToCollect > 0 ? `Chuyển khoản ${formatStaffCurrency(amountToCollect)}` : 'Xác nhận xe ra'}
      </Button>
    </div>
  )
}

export type { CheckoutMethod }
