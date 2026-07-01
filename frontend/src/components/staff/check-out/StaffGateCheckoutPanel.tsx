import { useState } from 'react'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { GateCheckoutPreview, GateSession } from '../../../services/staffGateApi'
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
  const checkoutVerified = Boolean(
    session && verifiedSessionId === session._id && verifiedQrValue,
  )

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
      <section className="liquid-glass-card overflow-hidden rounded-2xl">
        <div className="border-b border-theme bg-gradient-to-r from-amber-500/15 via-transparent to-transparent p-5 md:p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-lg font-black text-white shadow-lg shadow-amber-500/20">
              OUT
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">Quy trình xe ra</p>
              <h2 className="mt-1 text-xl font-bold text-fg">Thanh toán và trả xe</h2>
              <p className="mt-1 text-sm text-muted">Tìm xe đang gửi, kiểm tra chi phí và xác nhận phương tiện rời bãi.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:p-6">
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
        </div>
      </section>

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
