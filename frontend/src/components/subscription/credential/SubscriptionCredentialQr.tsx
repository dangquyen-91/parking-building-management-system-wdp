import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import type { Subscription } from '../../../services/userSubscriptionApi'

type SubscriptionCredentialQrProps = {
  subscription: Subscription
  compact?: boolean
}

function buildResidentQrValue(subscription: Subscription) {
  return `PBMS-SUB|${subscription._id}|${subscription.licensePlate}|${subscription.status}`
}

export function SubscriptionCredentialQr({ subscription, compact = false }: SubscriptionCredentialQrProps) {
  const [qrResult, setQrResult] = useState<{ value: string; dataUrl: string } | null>(null)
  const [failedQrValue, setFailedQrValue] = useState<string | null>(null)
  const isActive = subscription.status === 'active'
  const qrValue = useMemo(() => buildResidentQrValue(subscription), [subscription])
  const qrDataUrl = qrResult?.value === qrValue ? qrResult.dataUrl : ''
  const message = !isActive
    ? 'QR cư dân chỉ hiển thị khi gói đã active.'
    : failedQrValue === qrValue
      ? 'Không thể tạo QR cư dân. Vui lòng thử lại sau.'
      : 'Đang tạo thẻ QR cư dân...'

  useEffect(() => {
    let ignore = false

    async function loadQr() {
      if (!isActive) return

      try {
        const url = await QRCode.toDataURL(qrValue, {
          width: compact ? 240 : 320,
          margin: 3,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        })
        if (!ignore) {
          setQrResult({ value: qrValue, dataUrl: url })
          setFailedQrValue(null)
        }
      } catch {
        if (!ignore) setFailedQrValue(qrValue)
      }
    }

    void loadQr()

    return () => {
      ignore = true
    }
  }, [compact, isActive, qrValue])

  return (
    <div className="overflow-hidden rounded-xl border border-theme bg-white p-3 shadow-sm">
      <div className="flex aspect-square w-full items-center justify-center">
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`Thẻ QR cư dân ${subscription.licensePlate}`}
            className="block size-full object-contain"
          />
        ) : (
          <p className="px-4 text-center text-xs font-medium text-zinc-500">{message}</p>
        )}
      </div>
    </div>
  )
}
