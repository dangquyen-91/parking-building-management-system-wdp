import type { SubscriptionPayment } from '../../services/userSubscriptionApi'
import { formatSubscriptionCurrency } from '../../utils/subscriptionUi'
import { rememberSubscriptionPaymentReturn } from '../../utils/subscriptionPaymentReturn'

type SubscriptionPaymentCardProps = {
  payment: SubscriptionPayment
}

export function SubscriptionPaymentCard({ payment }: SubscriptionPaymentCardProps) {
  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Thanh toán PayOS</p>
      <h2 className="mt-2 text-lg font-semibold text-fg">{formatSubscriptionCurrency(payment.amount)}</h2>
      <p className="mt-2 text-sm text-muted">
        Đơn mua gói đang chờ thanh toán. Hãy mở PayOS để hoàn tất và kích hoạt gói cư dân.
      </p>

      <dl className="mt-5 grid gap-3 rounded-lg border border-theme bg-badge p-4 text-sm">
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
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg"
      >
        Mở trang thanh toán PayOS
      </a>
    </section>
  )
}
