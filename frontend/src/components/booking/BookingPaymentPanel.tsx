import type { BookingPayment } from '../../services/bookingApi'
import { formatBookingCurrency } from './bookingUtils'

type BookingPaymentPanelProps = {
  payment: BookingPayment
}

export function BookingPaymentPanel({ payment }: BookingPaymentPanelProps) {
  return (
    <section className="liquid-glass-card rounded-lg p-5 md:p-7">
      <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-subtle">Thanh toán // PayOS</p>
      <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Thanh toán đơn đặt chỗ</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Đơn đặt chỗ đang chờ thanh toán. Hãy mở trang PayOS để hệ thống tự động kích hoạt đơn sau khi nhận kết quả thanh toán.
      </p>

      <div className="mt-8">
        <div className="flex flex-col justify-between gap-5 rounded-lg border border-theme bg-badge p-5">
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-subtle">Mã đơn</dt>
              <dd className="mt-1 font-medium text-fg">{payment.orderCode}</dd>
            </div>
            <div>
              <dt className="text-subtle">Số tiền</dt>
              <dd className="mt-1 font-medium text-fg">{formatBookingCurrency(payment.amount)}</dd>
            </div>
            {payment.accountNumber && (
              <div>
                <dt className="text-subtle">Tài khoản</dt>
                <dd className="mt-1 font-medium text-fg">{payment.accountNumber}</dd>
              </div>
            )}
            {payment.accountName && (
              <div>
                <dt className="text-subtle">Người nhận</dt>
                <dd className="mt-1 font-medium text-fg">{payment.accountName}</dd>
              </div>
            )}
          </dl>

          <a
            href={payment.checkoutUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex h-11 items-center justify-center rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5"
          >
            Mở trang thanh toán PayOS
          </a>
        </div>
      </div>
    </section>
  )
}
