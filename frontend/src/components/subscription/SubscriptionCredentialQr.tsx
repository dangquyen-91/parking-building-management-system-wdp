import { useEffect, useMemo, useState } from 'react'
import QRCode from 'qrcode'
import type { Subscription } from '../../services/userSubscriptionApi'

type SubscriptionCredentialQrProps = {
  subscription: Subscription
  compact?: boolean
}

export function SubscriptionCredentialQr({ subscription, compact = false }: SubscriptionCredentialQrProps) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [qrError, setQrError] = useState(false)

  const plan = subscription.planId
  const slot = subscription.slotId
  const owner = subscription.userId && typeof subscription.userId !== 'string' ? subscription.userId : null
  const payload = useMemo(
    () =>
      JSON.stringify({
        type: 'resident-subscription-credential',
        version: 1,
        issuer: 'parking-building-management-system',
        subject: {
          userId: owner?._id ?? null,
          fullName: owner?.fullName ?? null,
          resident: true,
        },
        credential: {
          subscriptionId: subscription._id,
          licensePlate: subscription.licensePlate,
          vehicleType: subscription.vehicleType,
          status: subscription.status,
          validFrom: subscription.startDate ?? null,
          validUntil: subscription.endDate ?? null,
          plan: {
            id: plan._id,
            code: plan.code,
            name: plan.name,
            durationDays: plan.durationDays,
          },
          slot: slot
            ? {
                id: slot._id,
                code: slot.slotCode,
                floorNumber: slot.floorId?.floorNumber ?? null,
              }
            : null,
        },
        verification: {
          method: 'lookup-subscription',
          subscriptionId: subscription._id,
          licensePlate: subscription.licensePlate,
        },
      }),
    [owner, plan, slot, subscription],
  )

  useEffect(() => {
    let ignore = false
    setQrError(false)

    void QRCode.toDataURL(payload, {
      width: compact ? 180 : 280,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#111827',
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (!ignore) setQrDataUrl(url)
      })
      .catch(() => {
        if (!ignore) {
          setQrDataUrl('')
          setQrError(true)
        }
      })

    return () => {
      ignore = true
    }
  }, [compact, payload])

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
          <p className="px-4 text-center text-xs font-medium text-zinc-500">
            {qrError ? 'Không thể tạo thẻ QR cư dân.' : 'Đang tạo thẻ QR cư dân...'}
          </p>
        )}
      </div>
    </div>
  )
}
