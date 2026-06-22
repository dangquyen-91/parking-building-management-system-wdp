import { useEffect, useRef, useState } from 'react'
import type QrScanner from 'qr-scanner'

type StaffGateQrScannerProps = {
  title: string
  description: string
  verified: boolean
  disabled?: boolean
  onScan: (qrValue: string) => void
}

export function StaffGateQrScanner({
  title,
  description,
  verified,
  disabled = false,
  onScan,
}: StaffGateQrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [cameraActive, setCameraActive] = useState(false)
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string>()

  useEffect(() => {
    return () => {
      scannerRef.current?.destroy()
      scannerRef.current = null
    }
  }, [])

  async function startScanner() {
    if (!videoRef.current || isStarting || disabled) return

    setError(undefined)
    setIsStarting(true)
    setCameraActive(true)

    try {
      const { default: QrScannerClass } = await import('qr-scanner')
      const scanner = new QrScannerClass(
        videoRef.current,
        (result) => handleQrValue(result.data),
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
      setError('Không mở được camera quét QR. Hãy kiểm tra quyền camera hoặc dùng HTTPS/localhost.')
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
    if (!file || disabled) return
    setError(undefined)

    try {
      const { default: QrScannerClass } = await import('qr-scanner')
      const result = await QrScannerClass.scanImage(file, {
        returnDetailedScanResult: true,
        alsoTryWithoutScanRegion: true,
      })
      handleQrValue(result.data)
    } catch {
      setError('Không tìm thấy mã QR hợp lệ trong ảnh.')
    }
  }

  function handleQrValue(qrValue: string) {
    if (!qrValue) return
    stopScanner()
    onScan(qrValue)
  }

  return (
    <section className={['overflow-hidden rounded-xl border', verified ? 'border-emerald-500/35 bg-emerald-500/10' : 'border-amber-500/35 bg-amber-500/10'].join(' ')}>
      <div className="flex flex-wrap items-start justify-between gap-3 p-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">{title}</p>
          <h3 className="mt-1 text-sm font-bold text-fg">{verified ? 'QR hợp lệ - biển số khớp' : 'Chờ quét QR'}</h3>
          <p className="mt-1 text-xs text-muted">{description}</p>
        </div>
        <span className={['rounded-full px-3 py-1 text-[10px] font-bold text-white', verified ? 'bg-emerald-500' : 'bg-amber-500'].join(' ')}>
          {verified ? 'ĐÃ XÁC MINH' : 'CHỜ QR'}
        </span>
      </div>

      {!verified && (
        <div className="border-t border-amber-500/20 p-4">
          <div className={`relative mb-3 overflow-hidden rounded-xl bg-black ${cameraActive ? 'block' : 'hidden'}`}>
            <video ref={videoRef} muted playsInline className="aspect-video w-full object-cover" />
            <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-lg bg-black/60 px-3 py-2 text-center text-[10px] font-semibold text-white/80 backdrop-blur">
              Đưa toàn bộ mã QR vào giữa khung hình
            </div>
          </div>

          {error && <p className="mb-3 rounded-lg border border-rose-500/25 bg-rose-500/10 p-3 text-xs text-rose-700 dark:text-rose-200">{error}</p>}

          <div className="grid gap-2 sm:grid-cols-2">
            <button
              type="button"
              onClick={cameraActive ? stopScanner : () => void startScanner()}
              disabled={disabled || isStarting}
              className="h-11 rounded-xl bg-amber-600 px-4 text-xs font-bold text-white hover:bg-amber-500 disabled:opacity-50"
            >
              {isStarting ? 'Đang mở camera...' : cameraActive ? 'Dừng quét QR' : 'Mở camera quét QR'}
            </button>
            <label className="flex h-11 cursor-pointer items-center justify-center rounded-xl border border-theme bg-badge px-4 text-xs font-bold text-fg hover:bg-ghost has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-50">
              Tải ảnh QR
              <input type="file" accept="image/*" disabled={disabled} className="hidden" onChange={(event) => void handleQrFile(event.target.files?.[0])} />
            </label>
          </div>
        </div>
      )}
    </section>
  )
}
