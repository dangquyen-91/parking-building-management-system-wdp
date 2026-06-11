import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import type { SubscriptionPayment } from '../../services/userSubscriptionApi'
import { formatSubscriptionCurrency } from '../../utils/subscriptionUi'

type SubscriptionPaymentCardProps = {
  payment: SubscriptionPayment
}

export function SubscriptionPaymentCard({ payment }: SubscriptionPaymentCardProps) {
  const [qrImage, setQrImage] = useState('')
  const [qrError, setQrError] = useState<string | null>(null)
  const qrPayloads = useMemo(
    () => [payment.qrCode, payment.checkoutUrl].filter(Boolean) as string[],
    [payment.checkoutUrl, payment.qrCode],
  )

  useEffect(() => {
    let ignore = false

    async function buildQrImage() {
      setQrError(null)
      setQrImage('')

      if (qrPayloads.length === 0) {
        setQrError('Chưa có dữ liệu QR từ cổng thanh toán.')
        return
      }

      for (const payload of qrPayloads) {
        if (isImageSource(payload)) {
          setQrImage(payload)
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
          // Try the next payload, usually the PayOS checkoutUrl fallback.
        }
      }

      if (!ignore) setQrError('Không tạo được mã QR. Vui lòng mở trang thanh toán PayOS.')
    }

    void buildQrImage()

    return () => {
      ignore = true
    }
  }, [qrPayloads])

  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Thanh toán PayOS</p>
      <h2 className="mt-2 text-lg font-semibold text-fg">{formatSubscriptionCurrency(payment.amount)}</h2>
      <p className="mt-2 text-sm text-muted">
        Sau khi thanh toán thành công, webhook sẽ kích hoạt gói cư dân.
      </p>

      {qrImage ? (
        <img
          src={qrImage}
          alt="Mã QR thanh toán PayOS"
          className="mt-4 aspect-square w-full rounded-lg border border-theme bg-white object-contain p-3"
        />
      ) : (
        <div className="mt-4 flex aspect-square w-full items-center justify-center rounded-lg border border-theme bg-badge p-4 text-center text-sm text-muted">
          {qrError ?? 'Đang tạo mã QR...'}
        </div>
      )}

      <dl className="mt-4 grid gap-2 rounded-lg border border-theme bg-badge p-3 text-xs">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-subtle">Mã đơn</dt>
          <dd className="font-semibold text-fg">{payment.orderCode}</dd>
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
        className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg"
      >
        Mở trang thanh toán
      </a>
    </section>
  )
}

function isImageSource(value: string) {
  return (
    value.startsWith('data:image/') ||
    /^https?:\/\/.+\.(png|jpg|jpeg|webp|svg)(\?.*)?$/i.test(value)
  )
}
