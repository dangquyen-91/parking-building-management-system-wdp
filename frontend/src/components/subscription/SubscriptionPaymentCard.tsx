import type { Subscription, SubscriptionPayment } from '../../services/userSubscriptionApi'
import { formatSubscriptionCurrency } from '../../utils/subscriptionUi'
import { rememberSubscriptionPaymentReturn } from '../../utils/subscriptionPaymentReturn'

type SubscriptionPaymentCardProps = {
  payment: SubscriptionPayment
  subscription: Subscription
}

export function SubscriptionPaymentCard({ payment, subscription }: SubscriptionPaymentCardProps) {
  const plan = subscription.planId
  const slot = subscription.slotId

  return (
    <section className="overflow-hidden rounded-xl border border-emerald-500/30 bg-emerald-500/10">
      <div className="border-b border-emerald-500/20 p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-200">
          Thanh toán PayOS
        </p>
        <h2 className="mt-2 text-2xl font-black text-fg">{formatSubscriptionCurrency(payment.amount)}</h2>
        <p className="mt-2 text-sm text-muted">
          Đơn mua gói đã được tạo. Vui lòng thanh toán qua PayOS; sau khi thanh toán thành công và hệ thống kích hoạt gói, thẻ QR cư dân sẽ được hiển thị trong gói của bạn.
        </p>
      </div>

      <dl className="grid gap-3 p-5 text-sm">
        <PaymentDetail label="Mã đơn" value={payment.orderCode} />
        <PaymentDetail label="Gói" value={plan.name} />
        <PaymentDetail label="Biển số" value={subscription.licensePlate} />
        <PaymentDetail label="Thời hạn" value={`${plan.durationDays} ngày`} />
        <PaymentDetail label="Số tiền" value={formatSubscriptionCurrency(payment.amount)} />
        {slot?.slotCode && <PaymentDetail label="Vị trí" value={slot.slotCode} />}
      </dl>

      <a
        href={payment.checkoutUrl}
        target="_blank"
        rel="noreferrer"
        onClick={() => rememberSubscriptionPaymentReturn(payment.orderCode, subscription._id)}
        className="m-5 mt-0 inline-flex h-12 w-[calc(100%-2.5rem)] items-center justify-center rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20"
      >
        Mở PayOS để thanh toán
      </a>
    </section>
  )
}

function PaymentDetail({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-subtle">{label}</dt>
      <dd className="break-all text-right font-semibold text-fg">{value}</dd>
    </div>
  )
}
