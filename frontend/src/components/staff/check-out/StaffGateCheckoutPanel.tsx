import { useState } from 'react'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { GateCheckoutPreview, GateSession } from '../../../services/staffGateApi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { StaffGateQrVerifier } from '../scanner/StaffGateQrVerifier'
import { StaffGateCheckoutActions, type CheckoutMethod } from './StaffGateCheckoutActions'
import { StaffGateCheckoutConfirmDialog } from './StaffGateCheckoutConfirmDialog'
import { StaffGateCheckoutDetails } from './StaffGateCheckoutDetails'
import { StaffGateCheckoutLookup } from './StaffGateCheckoutLookup'

type StaffGateCheckoutPanelProps = {
  query: string
  session?: GateSession
  preview: GateCheckoutPreview | null
  isPreviewLoading: boolean
  isSubmitting: boolean
  floorMap: Map<string, Floor>
  onQueryChange: (value: string) => void
  onCheckoutCash: (session: GateSession, qrValue: string) => void
  onCheckoutTransfer: (session: GateSession, qrValue: string) => void
  onQrError?: (message: string) => void
  onQrSuccess?: (message: string) => void
}

export function StaffGateCheckoutPanel({
  query,
  session,
  preview,
  isPreviewLoading,
  isSubmitting,
  floorMap,
  onQueryChange,
  onCheckoutCash,
  onCheckoutTransfer,
  onQrError,
  onQrSuccess,
}: StaffGateCheckoutPanelProps) {
  const [confirmMethod, setConfirmMethod] = useState<CheckoutMethod | null>(null)
  const [verifiedSessionId, setVerifiedSessionId] = useState('')
  const [verifiedQrValue, setVerifiedQrValue] = useState('')
  const amountToCollect = preview?.toCollect ?? session?.fee ?? 0
  const checkoutVerified = Boolean(session && verifiedSessionId === session._id && verifiedQrValue)

  function handleConfirmCheckout() {
    if (!session || !confirmMethod || !verifiedQrValue) return

    if (confirmMethod === 'cash') {
      onCheckoutCash(session, verifiedQrValue)
    } else {
      onCheckoutTransfer(session, verifiedQrValue)
    }

    setConfirmMethod(null)
  }

  return (
    <>
      <Card className="overflow-hidden border-emerald-500/20 bg-gradient-to-br from-background via-background to-emerald-500/5">
        <CardHeader>
          <CardDescription>Quy trình xe ra</CardDescription>
          <CardTitle>Thanh toán và trả xe</CardTitle>
          <CardDescription>
            Tìm xe đang gửi, kiểm tra chi phí và xác nhận phương tiện rời bãi.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-5">
          <StaffGateCheckoutLookup query={query} onQueryChange={onQueryChange} />

          <StaffGateQrVerifier
            key={session?._id ?? 'no-checkout-session'}
            session={session}
            verified={Boolean(session && verifiedSessionId === session._id)}
            onVerified={(qrValue) => {
              if (session) {
                setVerifiedSessionId(session._id)
                setVerifiedQrValue(qrValue)
              }
            }}
            onError={onQrError}
            onSuccess={onQrSuccess}
          />

          <StaffGateCheckoutDetails
            session={session}
            preview={preview}
            amountToCollect={amountToCollect}
            isPreviewLoading={isPreviewLoading}
            floorMap={floorMap}
            actions={session ? (
              <StaffGateCheckoutActions
                amountToCollect={amountToCollect}
                isSubmitting={isSubmitting}
                isPreviewLoading={isPreviewLoading}
                checkoutVerified={checkoutVerified}
                onSelectMethod={setConfirmMethod}
              />
            ) : null}
          />
        </CardContent>
      </Card>

      {session && confirmMethod && (
        <StaffGateCheckoutConfirmDialog
          session={session}
          method={confirmMethod}
          amount={amountToCollect}
          isSubmitting={isSubmitting}
          onCancel={() => setConfirmMethod(null)}
          onConfirm={handleConfirmCheckout}
        />
      )}
    </>
  )
}
