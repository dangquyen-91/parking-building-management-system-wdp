import { useState } from 'react'
import type { GateSession } from '../../services/staffGateApi'
import { validateExitQr } from '../../utils/staffGateQr'
import { StaffGateQrScanner } from './StaffGateQrScanner'

type StaffGateQrVerifierProps = {
  session?: GateSession
  verified: boolean
  onVerified: (qrValue: string) => void
}

export function StaffGateQrVerifier({
  session,
  verified,
  onVerified,
}: StaffGateQrVerifierProps) {
  const [error, setError] = useState<string>()

  function verifyQrValue(qrValue: string) {
    if (!session) return

    const message = validateExitQr({ qrValue, session })
    if (message) {
      setError(message)
      return
    }

    setError(undefined)
    onVerified(qrValue)
  }

  return (
    <div className="grid gap-3">
      <StaffGateQrScanner
        title="Xác minh QR cổng ra"
        description={session ? `Quét QR và đối chiếu với biển số camera ${session.licensePlate}.` : 'Tìm xe bằng camera hoặc biển số trước khi quét QR.'}
        verified={verified}
        disabled={!session}
        onScan={verifyQrValue}
      />
      {verified && (
        <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-3 text-xs font-semibold text-emerald-700 dark:text-emerald-200">
          QR đã khớp với biển số camera. Có thể tiếp tục thanh toán và cho xe ra.
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-200">
          {error}
        </p>
      )}
    </div>
  )
}
