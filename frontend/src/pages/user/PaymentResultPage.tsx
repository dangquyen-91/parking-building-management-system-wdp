import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { BookingTopNav } from '../../components/booking'
import { SubscriptionCredentialQr } from '../../components/subscription'
import { userSubscriptionApi, type Subscription } from '../../services/userSubscriptionApi'
import { consumeStaffGatePaymentReturn } from '../../utils/staffGatePaymentReturn'
import { consumeSubscriptionPaymentReturn } from '../../utils/subscriptionPaymentReturn'

type PaymentResultPageProps = {
  status: 'success' | 'cancel'
}

const resultCopy = {
  success: {
    eyebrow: 'Thanh toán // Thành công',
    title: 'Thanh toán thành công',
    description:
      'Cảm ơn bạn. Hệ thống sẽ tự động kích hoạt đơn sau khi PayOS gửi kết quả xác nhận về máy chủ.',
    badge: 'Đã ghi nhận thanh toán',
    panelClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100',
    mark: '✓',
    primaryLabel: 'Xem đơn đặt chỗ',
    primaryTo: '/my-bookings',
    secondaryLabel: 'Tạo đặt chỗ mới',
    secondaryTo: '/booking',
  },
  cancel: {
    eyebrow: 'Thanh toán // Đã hủy',
    title: 'Bạn đã hủy thanh toán',
    description:
      'Đơn đặt chỗ vẫn chưa được thanh toán. Bạn có thể tạo lại đặt chỗ hoặc quay về trang đặt chỗ để thử lại.',
    badge: 'Thanh toán chưa hoàn tất',
    panelClass: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-100',
    mark: '!',
    primaryLabel: 'Đặt chỗ lại',
    primaryTo: '/booking',
    secondaryLabel: 'Về trang chủ',
    secondaryTo: '/',
  },
} satisfies Record<PaymentResultPageProps['status'], Record<string, string>>

const subscriptionResultCopy = {
  success: {
    eyebrow: 'Gói cư dân // Thanh toán thành công',
    title: 'Thanh toán gói thành công',
    description: 'Hệ thống đang kích hoạt gói cư dân sau khi nhận xác nhận từ PayOS.',
    badge: 'Đã ghi nhận thanh toán',
    panelClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100',
    mark: '✓',
    primaryLabel: 'Xem gói của tôi',
    primaryTo: '/my-subscriptions',
    secondaryLabel: 'Mua gói khác',
    secondaryTo: '/subscriptions',
  },
  cancel: {
    eyebrow: 'Gói cư dân // Đã hủy',
    title: 'Bạn đã hủy thanh toán gói',
    description: 'Gói cư dân chưa được kích hoạt. Bạn có thể quay lại để tạo đơn thanh toán mới.',
    badge: 'Thanh toán chưa hoàn tất',
    panelClass: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-100',
    mark: '!',
    primaryLabel: 'Quay lại mua gói',
    primaryTo: '/subscriptions',
    secondaryLabel: 'Xem gói của tôi',
    secondaryTo: '/my-subscriptions',
  },
} satisfies Record<PaymentResultPageProps['status'], Record<string, string>>

function getStaffResultCopy(status: PaymentResultPageProps['status'], licensePlate: string) {
  const checkoutPath = `/staff/check-out?checkout=${encodeURIComponent(licensePlate)}`

  return status === 'success'
    ? {
        eyebrow: 'Xe ra // Thanh toán thành công',
        title: 'Đã ghi nhận thanh toán xe ra',
        description: `Quay lại cổng để kiểm tra trạng thái xe ${licensePlate} trước khi mở cổng.`,
        badge: 'Đã ghi nhận thanh toán',
        panelClass: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100',
        mark: '✓',
        primaryLabel: 'Quay lại kiểm tra xe ra',
        primaryTo: checkoutPath,
        secondaryLabel: 'Xem xe đang gửi',
        secondaryTo: '/staff/vehicles',
      }
    : {
        eyebrow: 'Xe ra // Thanh toán đã hủy',
        title: 'Thanh toán xe ra chưa hoàn tất',
        description: `Quay lại cổng để tiếp tục xử lý thanh toán cho xe ${licensePlate}.`,
        badge: 'Thanh toán chưa hoàn tất',
        panelClass: 'border-amber-500/40 bg-amber-500/10 text-amber-800 dark:text-amber-100',
        mark: '!',
        primaryLabel: 'Quay lại xe ra',
        primaryTo: checkoutPath,
        secondaryLabel: 'Xem xe đang gửi',
        secondaryTo: '/staff/vehicles',
      }
}

export function PaymentResultPage({ status }: PaymentResultPageProps) {
  const [searchParams] = useSearchParams()
  const orderCode = searchParams.get('orderCode')
  const payosStatus = searchParams.get('status')
  const [staffPayment] = useState(() => consumeStaffGatePaymentReturn(orderCode))
  const [subscriptionPaymentReturn] = useState<ReturnType<typeof consumeSubscriptionPaymentReturn>>(() => (
    staffPayment ? null : consumeSubscriptionPaymentReturn(orderCode)
  ))
  const [paidSubscription, setPaidSubscription] = useState<Subscription | null>(null)
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(false)
  const copy = staffPayment
    ? getStaffResultCopy(status, staffPayment.licensePlate)
    : subscriptionPaymentReturn
      ? subscriptionResultCopy[status]
      : resultCopy[status]

  useEffect(() => {
    if (status !== 'success' || !subscriptionPaymentReturn?.subscriptionId) return

    let ignore = false
    setIsLoadingSubscription(true)

    const timeoutId = window.setTimeout(() => {
      void userSubscriptionApi.getMySubscriptions()
        .then((response) => {
          if (ignore) return
          const subscription = response.subscriptions.find((item) => item._id === subscriptionPaymentReturn.subscriptionId)
          setPaidSubscription(subscription ?? null)
        })
        .finally(() => {
          if (!ignore) setIsLoadingSubscription(false)
        })
    }, 1200)

    return () => {
      ignore = true
      window.clearTimeout(timeoutId)
    }
  }, [subscriptionPaymentReturn, status])

  return (
    <div className="min-h-screen bg-page text-fg">
      <BookingTopNav />

      <main id="main" tabIndex={-1} className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-4xl items-center p-4 md:p-8">
        <section className="liquid-glass-card w-full rounded-lg p-5 md:p-8">
          <div className={`inline-flex h-14 w-14 items-center justify-center rounded-full border text-3xl font-bold ${copy.panelClass}`}>
            {copy.mark}
          </div>

          <p className="mt-6 text-[10px] uppercase tracking-[0.2em] text-subtle">{copy.eyebrow}</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-fg md:text-4xl">{copy.title}</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">{copy.description}</p>
          {status === 'success' && !subscriptionPaymentReturn && !staffPayment && (
            <p className="mt-2 max-w-2xl text-sm font-medium text-emerald-700 dark:text-emerald-100">
              Email xác nhận booking sẽ được gửi đến địa chỉ bạn đã nhập sau khi hệ thống nhận kết quả thanh toán.
            </p>
          )}

          <div className="mt-7 rounded-lg border border-theme bg-badge p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs text-subtle">Trạng thái</p>
                <p className="mt-1 text-sm font-semibold text-fg">{copy.badge}</p>
              </div>
              {orderCode && (
                <div className="sm:text-right">
                  <p className="text-xs text-subtle">Mã đơn PayOS</p>
                  <p className="mt-1 text-sm font-semibold text-fg">{orderCode}</p>
                </div>
              )}
              {payosStatus && !orderCode && (
                <div className="sm:text-right">
                  <p className="text-xs text-subtle">Phản hồi PayOS</p>
                  <p className="mt-1 text-sm font-semibold text-fg">{payosStatus}</p>
                </div>
              )}
            </div>
          </div>

          {status === 'success' && subscriptionPaymentReturn && (
            <div className="mt-7 rounded-lg border border-theme bg-badge p-4">
              {isLoadingSubscription ? (
                <p className="text-sm text-muted">Đang kiểm tra trạng thái gói để tạo thẻ QR cư dân...</p>
              ) : paidSubscription?.status === 'active' ? (
                <div className="grid gap-4 md:grid-cols-[14rem_minmax(0,1fr)] md:items-center">
                  <SubscriptionCredentialQr subscription={paidSubscription} />
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">Thẻ cư dân QR</p>
                    <h2 className="mt-2 text-xl font-bold text-fg">{paidSubscription.licensePlate}</h2>
                    <p className="mt-2 text-sm text-muted">
                      Gói đã được kích hoạt. QR này dùng để chứng minh xe là cư dân đã đăng ký gói trong hệ thống.
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted">
                  Thanh toán đã hoàn tất. Nếu QR cư dân chưa hiện ngay, PayOS webhook có thể đang xử lý; vào “Gói của tôi” và làm mới sau vài giây.
                </p>
              )}
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              to={copy.primaryTo}
              className="inline-flex h-11 items-center justify-center rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5"
            >
              {copy.primaryLabel}
            </Link>
            <Link
              to={copy.secondaryTo}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-theme bg-badge px-4 text-sm font-semibold text-fg hover:bg-ghost"
            >
              {copy.secondaryLabel}
            </Link>
          </div>
        </section>
      </main>
    </div>
  )
}
