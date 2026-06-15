import type { SubscriptionPayment } from '../../services/userSubscriptionApi'
import { formatSubscriptionCurrency } from '../../utils/subscriptionUi'
import { rememberSubscriptionPaymentReturn } from '../../utils/subscriptionPaymentReturn'

type SubscriptionPaymentCardProps = {
  payment: SubscriptionPayment
}

export function SubscriptionPaymentCard({ payment }: SubscriptionPaymentCardProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/10">
      <div className="border-b border-emerald-500/20 p-5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">Thanh toán PayOS</p>
      <h2 className="mt-2 text-2xl font-black text-fg">{formatSubscriptionCurrency(payment.amount)}</h2>
      <p className="mt-2 text-sm text-muted">
        Đơn mua gói đang chờ thanh toán. Hãy mở PayOS để hoàn tất và kích hoạt gói cư dân.
      </p>

      </div>
      <dl className="grid gap-3 p-5 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-subtle">Mã đơn</dt>
          <dd className="font-semibold text-fg">{payment.orderCode}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-subtle">Số tiền</dt>
          <dd className="font-semibold text-fg">{formatSubscriptionCurrency(payment.amount)}</dd>
        </div>
        {payment.accountNumber && (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-subtle">Tài khoản</dt>
            <dd className="font-semibold text-fg">{payment.accountNumber}</dd>
          </div>
        )}
      </dl>

      <a
        href={payment.checkoutUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => rememberSubscriptionPaymentReturn(payment.orderCode)}
        className="m-5 mt-0 inline-flex h-12 w-[calc(100%-2.5rem)] items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20"
      >
        Mở PayOS để thanh toán →
      </a>
    </section>
  )
}
