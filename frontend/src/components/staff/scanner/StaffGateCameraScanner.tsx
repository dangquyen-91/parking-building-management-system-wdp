import { useRef, useState } from 'react'
import Webcam from 'react-webcam'
import { staffGateApi } from '../../../services/staffGateApi'
import { normalizePlate } from '../data/staffGateUtils'

type StaffGateCameraScannerProps = {
  gate: 'entry' | 'exit'
  onUsePlate: (plate: string) => void
}

const VIDEO_CONSTRAINTS: MediaTrackConstraints = {
  facingMode: { ideal: 'environment' },
  width: { ideal: 1920 },
  height: { ideal: 1080 },
}

const MAX_IMAGE_DATA_LENGTH = 80_000

function formatRecognizedPlate(value: string) {
  const plate = value.toUpperCase().replace(/[^A-Z0-9]/g, '')

  if (/^\d{2}[A-Z]\d{5}$/.test(plate)) {
    return `${plate.slice(0, 3)}-${plate.slice(3, 6)}.${plate.slice(6)}`
  }

  if (/^\d{2}[A-Z]\d{6}$/.test(plate)) {
    return `${plate.slice(0, 4)}-${plate.slice(4, 7)}.${plate.slice(7)}`
  }

  return plate
}

function compressSnapshot(source: string) {
  return new Promise<string>((resolve, reject) => {
    const image = new Image()

    image.onload = () => {
      let targetWidth = Math.min(960, image.naturalWidth)
      let quality = 0.82
      const canvas = document.createElement('canvas')
      const context = canvas.getContext('2d')

      if (!context) {
        reject(new Error('Không thể xử lý ảnh camera.'))
        return
      }
      const drawingContext = context

      function drawImage() {
        const scale = targetWidth / image.naturalWidth
        canvas.width = Math.max(1, Math.round(targetWidth))
        canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
        drawingContext.drawImage(image, 0, 0, canvas.width, canvas.height)
      }

      drawImage()
      let compressed = canvas.toDataURL('image/jpeg', quality)

      while (compressed.length > MAX_IMAGE_DATA_LENGTH) {
        if (quality > 0.42) {
          quality -= 0.08
        } else if (targetWidth > 640) {
          targetWidth = Math.max(640, Math.round(targetWidth * 0.82))
          quality = 0.68
          drawImage()
        } else {
          quality = Math.max(0.25, quality - 0.05)
        }

        compressed = canvas.toDataURL('image/jpeg', quality)
        if (quality <= 0.25 && targetWidth <= 640) break
      }

      resolve(compressed)
    }

    image.onerror = () => reject(new Error('Không thể đọc ảnh camera.'))
    image.src = source
  })
}

function getRecognitionError(error: unknown) {
  const message = error instanceof Error ? error.message : ''
  const normalizedMessage = message.toLowerCase()

  if (normalizedMessage.includes('request entity too large') || normalizedMessage.includes('payload too large')) {
    return 'Ảnh có dung lượng quá lớn. Hãy chụp gần biển số hơn rồi thử lại.'
  }

  if (normalizedMessage.includes('missing plate_recognizer_token') || normalizedMessage.includes('not configured')) {
    return 'Dịch vụ nhận diện biển số chưa được cấu hình.'
  }

  if (normalizedMessage.includes('429')) {
    return 'Dịch vụ nhận diện đang giới hạn yêu cầu hoặc đã hết lượt. Hãy thử lại sau.'
  }

  return message || 'Không thể nhận diện biển số lúc này. Hãy thử lại hoặc nhập biển số thủ công.'
}

export function StaffGateCameraScanner({ gate, onUsePlate }: StaffGateCameraScannerProps) {
  const webcamRef = useRef<Webcam>(null)
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraReady, setCameraReady] = useState(false)
  const [snapshotUrl, setSnapshotUrl] = useState('')
  const [plateInput, setPlateInput] = useState('')
  const [confidence, setConfidence] = useState<number>()
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [error, setError] = useState<string>()
  const isEntry = gate === 'entry'
  const normalizedPlate = normalizePlate(plateInput)

  function openCamera() {
    setError(undefined)
    setSnapshotUrl('')
    setPlateInput('')
    setConfidence(undefined)
    setCameraReady(false)
    setCameraOpen(true)
  }

  function handleCameraError() {
    setCameraOpen(false)
    setCameraReady(false)
    setError('Không mở được camera. Hãy kiểm tra quyền camera hoặc sử dụng HTTPS/localhost.')
  }

  async function captureAndRecognize() {
    if (!cameraReady || isRecognizing) return

    const screenshot = webcamRef.current?.getScreenshot()
    if (!screenshot) {
      setError('Camera chưa chụp được ảnh. Hãy giữ biển số rõ nét rồi thử lại.')
      return
    }

    setSnapshotUrl(screenshot)
    setCameraOpen(false)
    setCameraReady(false)
    setError(undefined)
    setConfidence(undefined)
    setIsRecognizing(true)

    try {
      const image = await compressSnapshot(screenshot)
      const result = await staffGateApi.scanPlate(image)

      if (!result?.plate) {
        setError('Hệ thống chưa tìm thấy biển số. Hãy chụp gần hơn, đủ sáng và tránh bị nghiêng.')
        return
      }

      setPlateInput(formatRecognizedPlate(result.plate))
      setConfidence(Math.round(result.confidence * 100))
    } catch (recognitionError) {
      setError(getRecognitionError(recognitionError))
    } finally {
      setIsRecognizing(false)
    }
  }

  function handleUsePlate() {
    if (normalizedPlate.length < 4) return
    onUsePlate(normalizedPlate)
  }

  const status = isRecognizing
    ? 'Đang nhận diện'
    : cameraOpen
      ? cameraReady ? 'Camera sẵn sàng' : 'Đang mở camera'
      : snapshotUrl ? 'Đã chụp ảnh' : 'Chưa mở camera'

  return (
    <section className="overflow-hidden rounded-2xl border border-theme bg-black text-white shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${cameraReady ? 'animate-pulse bg-emerald-400' : 'bg-zinc-500'}`} />
          <div>
            <p className="text-xs font-bold">Camera cổng {isEntry ? 'vào' : 'ra'}</p>
            <p className="mt-0.5 text-[10px] text-white/45">Camera nhận diện biển số tự động</p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/55">
          {status}
        </span>
      </div>

      <div className="relative flex min-h-72 items-center justify-center overflow-hidden bg-linear-to-br from-zinc-800 via-zinc-950 to-black">
        {cameraOpen && (
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored={false}
            screenshotFormat="image/jpeg"
            screenshotQuality={0.95}
            forceScreenshotSourceSize
            videoConstraints={VIDEO_CONSTRAINTS}
            onUserMedia={() => setCameraReady(true)}
            onUserMediaError={handleCameraError}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {snapshotUrl && !cameraOpen && (
          <img src={snapshotUrl} alt="Ảnh phương tiện vừa chụp" className="absolute inset-0 h-full w-full object-cover" />
        )}
        {!cameraOpen && !snapshotUrl && (
          <div className="px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Mở camera để chụp biển số</p>
            <p className="mt-2 text-[10px] text-white/30">Giữ biển số rõ nét, đủ sáng và hướng thẳng vào camera.</p>
          </div>
        )}

        {isRecognizing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="text-center">
              <span className="mx-auto block size-8 animate-spin rounded-full border-2 border-white/20 border-t-sky-400" />
              <p className="mt-3 text-xs font-bold">Đang nhận diện biển số...</p>
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-3 border-t border-white/10 bg-white/5 p-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Biển số nhận diện được</p>
          <p className={`mt-1 text-lg font-black uppercase tracking-[0.08em] ${plateInput ? 'text-white' : 'text-white/30'}`}>
            {plateInput || 'Chưa có biển số'}
          </p>
          {confidence !== undefined ? (
            <p className={`mt-1 text-[10px] ${confidence >= 80 ? 'text-emerald-300' : 'text-amber-300'}`}>
              Độ tin cậy: {confidence}%. Hãy đối chiếu biển thật trước khi tiếp tục.
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-white/45">Kết quả chỉ được đưa vào ô tra cứu, không tự động mở cổng.</p>
          )}
          {error && <p className="mt-2 text-xs font-medium text-rose-300">{error}</p>}
        </div>

        {!cameraOpen ? (
          <button
            type="button"
            onClick={openCamera}
            disabled={isRecognizing}
            className="h-11 rounded-xl border border-white/15 bg-white/10 px-5 text-xs font-bold text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {snapshotUrl ? 'Chụp lại ảnh' : 'Mở camera'}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => void captureAndRecognize()}
            disabled={!cameraReady || isRecognizing}
            className="h-11 rounded-xl border border-white/15 bg-white/10 px-5 text-xs font-bold text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Chụp và nhận diện
          </button>
        )}

        <button
          type="button"
          onClick={handleUsePlate}
          disabled={normalizedPlate.length < 4 || isRecognizing}
          className={`h-11 rounded-xl px-5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-40 ${isEntry ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'}`}
        >
          Đưa vào ô tra cứu →
        </button>
      </div>
    </section>
  )
}
