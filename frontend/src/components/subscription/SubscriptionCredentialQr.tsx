import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import type { Subscription } from '../../services/userSubscriptionApi'

type SubscriptionCredentialQrProps = {
  subscription: Subscription
  compact?: boolean
}

function buildResidentQrValue(subscription: Subscription) {
  return `PBMS-SUB|${subscription._id}|${subscription.licensePlate}|${subscription.status}`
}

export function SubscriptionCredentialQr({ subscription, compact = false }: SubscriptionCredentialQrProps) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [message, setMessage] = useState('Đang tạo thẻ QR cư dân...')
  const isActive = subscription.status === 'active'
  const qrValue = useMemo(() => buildResidentQrValue(subscription), [subscription])

  useEffect(() => {
    let ignore = false
    setQrDataUrl('')

    async function loadQr() {
      if (!isActive) {
        setMessage('QR cư dân chỉ hiển thị khi gói đã active.')
        return
      }

      try {
        setMessage('Đang tạo thẻ QR cư dân...')
        const url = await QRCode.toDataURL(qrValue, {
          width: compact ? 240 : 320,
          margin: 3,
          errorCorrectionLevel: 'M',
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        })
        if (!ignore) setQrDataUrl(url)
      } catch {
        if (!ignore) {
          setQrDataUrl('')
          setMessage('Không thể tạo QR cư dân. Vui lòng thử lại sau.')
        }
      }
    }

    void loadQr()

    return () => {
      ignore = true
    }
  }, [compact, isActive, qrValue])

  return (
    <div className="rounded-xl border border-theme bg-white p-3 shadow-sm">
      <div className={`flex aspect-square items-center justify-center ${compact ? 'min-h-44' : 'min-h-64'}`}>
        {qrDataUrl ? (
          <img
            src={qrDataUrl}
            alt={`Thẻ QR cư dân ${subscription.licensePlate}`}
            className="size-full object-contain"
          />
        ) : (
          <p className="px-4 text-center text-xs font-medium text-zinc-500">{message}</p>
        )}
      </div>
    </div>
  )
}
