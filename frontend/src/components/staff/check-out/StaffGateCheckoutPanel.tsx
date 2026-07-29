import { useState, type ReactNode } from 'react'
import { LogOut, Search, ShieldCheck, WalletCards } from 'lucide-react'
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
      <Card className="overflow-hidden rounded-2xl border-emerald-500/20 bg-background shadow-xl shadow-slate-950/5">
        <CardHeader className="border-b border-white/15 bg-linear-to-r from-emerald-700 via-emerald-600 to-teal-500 p-5 text-white md:p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white/15 shadow-inner ring-1 ring-white/25">
              <LogOut className="size-6" />
            </span>
            <div>
              <CardDescription className="font-semibold uppercase tracking-[0.16em] text-white/70">Quy trình xe ra</CardDescription>
              <CardTitle className="mt-1 text-xl font-bold text-white">Thanh toán và trả xe</CardTitle>
              <CardDescription className="mt-1 text-white/75">
                Tìm xe đang gửi, xác minh QR, kiểm tra chi phí và mở cổng ra.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-5 bg-linear-to-b from-emerald-500/2.5 to-transparent p-5 md:p-6">
          <ProcessSection number="1" icon={<Search className="size-4" />} title="Tìm phương tiện" description="Quét camera hoặc nhập biển số xe đang gửi.">
            <StaffGateCheckoutLookup query={query} onQueryChange={onQueryChange} />
          </ProcessSection>

          <ProcessSection number="2" icon={<ShieldCheck className="size-4" />} title="Xác minh vé QR" description="QR phải khớp đúng phiên gửi và biển số xe.">
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
          </ProcessSection>

          <ProcessSection number="3" icon={<WalletCards className="size-4" />} title="Kiểm tra và thanh toán" description="Đối chiếu phí trước khi xác nhận xe rời bãi.">
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
          </ProcessSection>
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

function ProcessSection({
  number,
  icon,
  title,
  description,
  children,
}: {
  number: string
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <section className="grid gap-4 rounded-2xl border bg-card/80 p-4 shadow-sm md:p-5">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md shadow-emerald-500/20">
          {icon}
        </span>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-emerald-700 dark:text-emerald-300">Bước {number}</p>
          <h3 className="mt-0.5 font-bold">{title}</h3>
          <p className="mt-0.5 text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      {children}
    </section>
  )
}
