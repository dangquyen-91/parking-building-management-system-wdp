import { useEffect, useRef, useState } from 'react'
import type QrScanner from 'qr-scanner'
import type { GateSession } from '../../services/staffGateApi'
import { normalizePlate } from './staffGateUtils'

type StaffGateQrVerifierProps = {
  session?: GateSession
  verified: boolean
  manualOverride: boolean
  onVerified: () => void
  onManualOverride: () => void
}

export function StaffGateQrVerifier({
  session,
  verified,
  manualOverride,
  onVerified,
  onManualOverride,
}: StaffGateQrVerifierProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string>()
  const accepted = verified || manualOverride

  useEffect(() => {
    return () => {
      scannerRef.current?.destroy()
      scannerRef.current = null
    }
  }, [])

  async function startScanner() {
    if (!session || !videoRef.current || isStarting) return

    setError(undefined)
    setIsStarting(true)
    setCameraActive(true)

    try {
      const { default: QrScannerClass } = await import('qr-scanner')
      const scanner = new QrScannerClass(
        videoRef.current,
        (result) => verifyQrValue(result.data),
        {
          preferredCamera: 'environment',
          maxScansPerSecond: 8,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          returnDetailedScanResult: true,
          onDecodeError: () => undefined,
        },
      )

      scannerRef.current = scanner
      await scanner.start()
    } catch {
      scannerRef.current?.destroy()
      scannerRef.current = null
      setCameraActive(false)
      setError('Không mở được camera quét QR. Hãy kiểm tra quyền camera và sử dụng HTTPS hoặc localhost.')
    } finally {
      setIsStarting(false)
    }
  }

  function stopScanner() {
    scannerRef.current?.destroy()
    scannerRef.current = null
    setCameraActive(false)
    setIsStarting(false)
  }

  async function handleQrFile(file?: File) {
    if (!file || !session) return
    setError(undefined)

    try {
      const { default: QrScannerClass } = await import('qr-scanner')
      const result = await QrScannerClass.scanImage(file, {
        returnDetailedScanResult: true,
        alsoTryWithoutScanRegion: true,
      })
      verifyQrValue(result.data)
    } catch {
      setError('Không tìm thấy mã QR hợp lệ trong ảnh.')
    }
  }

  function verifyQrValue(rawValue: string) {
    if (!session) return

    try {
      const ticket = JSON.parse(rawValue) as { type?: string; sessionId?: string; licensePlate?: string }
      const matches =
        ticket.type === 'parking-session-ticket'
        && ticket.sessionId === session._id
        && normalizePlate(ticket.licensePlate ?? '') === normalizePlate(session.licensePlate)

      if (!matches) {
        setError('QR không thuộc phiên xe hoặc biển số đang chọn.')
        return
      }

      setError(undefined)
      stopScanner()
      onVerified()
    } catch {
      setError('QR không đúng định dạng vé gửi xe.')
    }
  }

  return (
    <section className={['overflow-hidden rounded-xl border', accepted ? 'border-emerald-500/35 bg-emerald-500/10' : 'border-amber-500/35 bg-amber-500/10'].join(' ')}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">Xác minh vé cổng ra</p>
          <h3 className="mt-1 text-sm font-bold text-fg">
            {verified ? 'QR hợp lệ - biển số khớp' : manualOverride ? 'Đang xử lý thủ công' : 'Quét QR và đối chiếu biển số'}
          </h3>
          <p className="mt-1 text-xs text-muted">
            {session ? `Đang đối chiếu vé với biển số ${session.licensePlate}.` : 'Tìm xe bằng camera hoặc biển số trước khi quét QR.'}
          </p>
        </div>
        <span className={['rounded-full px-3 py-1 text-[10px] font-bold', accepted ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'].join(' ')}>
          {accepted ? 'ĐÃ XÁC MINH' : 'CHỜ QUÉT QR'}
        </span>
      </div>

      {!accepted && (
        <div className="border-t border-amber-500/20 p-4">
          <div className={`relative mb-3 overflow-hidden rounded-xl bg-black ${cameraActive ? 'block' : 'hidden'}`}>
              <video ref={videoRef} muted playsInline className="aspect-video w-full object-cover" />
              <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-lg bg-black/60 px-3 py-2 text-center text-[10px] font-semibold text-white/80 backdrop-blur">
                Đưa toàn bộ mã QR vào giữa khung hình
              </div>
          </div>

          {error && <p className="mb-3 rounded-lg border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-200">{error}</p>}

          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={cameraActive ? stopScanner : () => void startScanner()}
              disabled={!session || isStarting}
              className="h-11 rounded-xl bg-amber-600 px-4 text-xs font-bold text-white hover:bg-amber-500 disabled:opacity-50"
            >
              {isStarting ? 'Đang mở camera...' : cameraActive ? 'Dừng quét QR' : 'Mở camera quét QR'}
            </button>
            <label className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-theme bg-badge px-4 text-xs font-bold text-fg hover:bg-ghost">
              Tải ảnh QR
              <input type="file" accept="image/*" className="hidden" onChange={(event) => void handleQrFile(event.target.files?.[0])} />
            </label>
            <button type="button" onClick={onManualOverride} disabled={!session} className="h-11 rounded-xl border border-theme bg-badge px-4 text-xs font-bold text-fg hover:bg-ghost disabled:opacity-50">
              Khách mất vé
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
