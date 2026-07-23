import { useEffect, useRef, useState } from 'react'
import type QrScanner from 'qr-scanner'
import { Alert, AlertDescription } from '../../ui/alert'
import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'

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
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardDescription>{title}</CardDescription>
          <CardTitle>{verified ? 'QR hợp lệ - biển số khớp' : 'Chờ quét QR'}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        <Badge variant={verified ? 'default' : 'secondary'}>
          {verified ? 'Đã xác minh' : 'Chờ QR'}
        </Badge>
      </CardHeader>

      {!verified && (
        <CardContent>
          <div className={`relative mb-3 overflow-hidden rounded-lg bg-black ${cameraActive ? 'block' : 'hidden'}`}>
            <video ref={videoRef} muted playsInline className="aspect-video w-full object-cover" />
            <div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-lg bg-black/60 px-3 py-2 text-center text-[10px] font-semibold text-white/80 backdrop-blur">
              Đưa toàn bộ mã QR vào giữa khung hình
            </div>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-3">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-2 sm:grid-cols-2">
            <Button
              type="button"
              onClick={cameraActive ? stopScanner : () => void startScanner()}
              disabled={disabled || isStarting}
            >
              {isStarting ? 'Đang mở camera...' : cameraActive ? 'Dừng quét QR' : 'Mở camera quét QR'}
            </Button>
            <Button type="button" variant="outline" asChild>
              <label className="cursor-pointer">
                Tải ảnh QR
                <input type="file" accept="image/*" disabled={disabled} className="hidden" onChange={(event) => void handleQrFile(event.target.files?.[0])} />
              </label>
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
