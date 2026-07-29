import type { BookingPayment } from '../../../services/bookingApi'
import { formatBookingCurrency } from '../bookingUtils'

type BookingPaymentPanelProps = {
  payment: BookingPayment
}

export function BookingPaymentPanel({ payment }: BookingPaymentPanelProps) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_60px_-35px_rgba(30,64,175,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 md:p-7">
      <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600 dark:text-sky-300">Thanh toán // PayOS</p>
      <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Thanh toán đơn đặt chỗ</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Đơn đặt chỗ đang chờ thanh toán. Hãy mở trang PayOS để hệ thống tự động kích hoạt đơn sau khi nhận kết quả thanh toán.
      </p>

      <div className="mt-8">
        <div className="flex flex-col justify-between gap-5 rounded-2xl border border-violet-200 bg-linear-to-br from-violet-50 to-sky-50 p-5 dark:border-violet-700/40 dark:from-violet-500/10 dark:to-sky-500/10">
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
            className="inline-flex h-12 items-center justify-center rounded-xl bg-linear-to-r from-violet-600 to-sky-500 px-4 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition-transform hover:-translate-y-0.5"
          >
            Mở trang thanh toán PayOS
          </a>
        </div>
      </div>
    </section>
  )
}
