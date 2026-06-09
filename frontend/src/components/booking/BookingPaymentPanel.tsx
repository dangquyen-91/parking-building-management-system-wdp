import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { BookingPayment } from '../../services/bookingApi'
import { formatBookingCurrency } from './bookingUtils'

type BookingPaymentPanelProps = {
  payment: BookingPayment
}

export function BookingPaymentPanel({ payment }: BookingPaymentPanelProps) {
  const [qrImage, setQrImage] = useState('')
  const [qrError, setQrError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    async function buildQrImage() {
      setQrImage('')
      setQrError(null)

      const payloads = [payment.qrCode, payment.checkoutUrl].filter(Boolean) as string[]

      for (const payload of payloads) {
        if (payload.startsWith('data:image/') || /^https?:\/\/.+\.(png|jpg|jpeg|webp|svg)(\?.*)?$/i.test(payload)) {
          if (!ignore) setQrImage(payload)
          return
        }

        try {
          const dataUrl = await QRCode.toDataURL(payload, {
            errorCorrectionLevel: 'M',
            margin: 2,
            scale: 8,
            color: {
              dark: '#111827',
              light: '#ffffff',
            },
          })
          if (!ignore) setQrImage(dataUrl)
          return
        } catch {
          // Try the next PayOS payload.
        }
      }

      if (!ignore) setQrError('Không thể tạo mã QR. Vui lòng mở liên kết thanh toán PayOS.')
    }

    void buildQrImage()

    return () => {
      ignore = true
    }
  }, [payment.checkoutUrl, payment.qrCode])

  return (
    <section className="liquid-glass-card rounded-lg p-5 md:p-7">
      <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-subtle">Thanh toán // PayOS</p>
      <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Quét mã để thanh toán</h1>
      <p className="mt-3 max-w-2xl text-sm text-muted">
        Đơn đặt chỗ đang chờ thanh toán. Hãy thanh toán qua PayOS để hệ thống tự động kích hoạt đơn sau khi nhận kết quả thanh toán.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-[18rem_minmax(0,1fr)]">
        {qrImage ? (
          <img
            src={qrImage}
            alt="Mã QR thanh toán PayOS cho đặt chỗ"
            className="aspect-square w-full rounded-lg border border-theme bg-white object-contain p-4"
          />
        ) : (
          <div className="flex aspect-square w-full items-center justify-center rounded-lg border border-theme bg-badge p-4 text-center text-sm text-muted">
            {qrError ?? 'Đang tạo mã QR...'}
          </div>
        )}

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
