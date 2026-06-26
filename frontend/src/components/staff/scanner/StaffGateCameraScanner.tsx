import { useEffect, useRef, useState } from 'react'
import type { Worker } from 'tesseract.js'
import { normalizePlate } from '../data/staffGateUtils'

type StaffGateCameraScannerProps = {
  gate: 'entry' | 'exit'
  onUsePlate: (plate: string) => void
}

const PLATE_CROP_WIDTH_RATIO = 0.82
const PLATE_CROP_HEIGHT_RATIO = 0.46
const PLATE_CROP_OFFSETS = [-0.12, 0, 0.12]

type OcrCandidate = {
  plate: string
  confidence: number
  score: number
}

function correctPlateCharacters(value: string) {
  const raw = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  if (raw.length < 3) return raw

  const digitCorrections: Record<string, string> = {
    B: '8',
    D: '0',
    G: '6',
    I: '1',
    L: '1',
    O: '0',
    Q: '0',
    S: '5',
    Z: '2',
  }
  const letterCorrections: Record<string, string> = {
    '0': 'O',
    '1': 'I',
    '2': 'Z',
    '5': 'S',
    '6': 'G',
    '8': 'B',
  }

  return raw
    .split('')
    .map((character, index) => {
      if (index === 2) return letterCorrections[character] ?? character
      return digitCorrections[character] ?? character
    })
    .join('')
}

function formatRecognizedPlate(value: string) {
  const plate = correctPlateCharacters(value)

  if (/^\d{2}[A-Z]\d{5}$/.test(plate)) {
    return `${plate.slice(0, 3)}-${plate.slice(3, 6)}.${plate.slice(6)}`
  }

  if (/^\d{2}[A-Z]\d{6}$/.test(plate)) {
    return `${plate.slice(0, 4)}-${plate.slice(4, 7)}.${plate.slice(7)}`
  }

  return plate
}

function getPlateCandidateValues(value: string) {
  const compact = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
  const candidates = new Set<string>()

  if (compact) candidates.add(compact)

  for (let length = 9; length >= 6; length -= 1) {
    for (let index = 0; index + length <= compact.length; index += 1) {
      candidates.add(compact.slice(index, index + length))
    }
  }

  return [...candidates]
}

function scoreCandidate(value: string, confidence: number): OcrCandidate {
  const plate = correctPlateCharacters(value)
  const isCarPlate = /^\d{2}[A-Z]\d{5}$/.test(plate)
  const isMotorcyclePlate = /^\d{2}[A-Z]\d{6}$/.test(plate)
  const hasExpectedPrefix = /^\d{2}[A-Z]/.test(plate)
  const expectedLength = plate.length === 8 || plate.length === 9

  return {
    plate,
    confidence,
    score:
      confidence
      + (isCarPlate || isMotorcyclePlate ? 150 : 0)
      + (hasExpectedPrefix ? 45 : 0)
      + (expectedLength ? 20 : 0),
  }
}

function createPlateCrops(video: HTMLVideoElement) {
  const sourceWidth = video.videoWidth * PLATE_CROP_WIDTH_RATIO
  const sourceHeight = video.videoHeight * PLATE_CROP_HEIGHT_RATIO
  const sourceY = (video.videoHeight - sourceHeight) / 2
  const scale = Math.max(1, 1200 / sourceWidth)

  function createCrop(mode: 'color' | 'grey' | 'binary', offsetRatio: number) {
    const centeredX = (video.videoWidth - sourceWidth) / 2
    const shiftedX = centeredX + video.videoWidth * offsetRatio
    const sourceX = Math.max(0, Math.min(video.videoWidth - sourceWidth, shiftedX))
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(sourceWidth * scale)
    canvas.height = Math.round(sourceHeight * scale)

    const context = canvas.getContext('2d', { willReadFrequently: true })
    if (!context) return canvas

    context.fillStyle = '#fff'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.drawImage(
      video,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      canvas.width,
      canvas.height,
    )

    if (mode === 'color') return canvas

    const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
    for (let index = 0; index < imageData.data.length; index += 4) {
      const red = imageData.data[index]
      const green = imageData.data[index + 1]
      const blue = imageData.data[index + 2]
      const grey = 0.299 * red + 0.587 * green + 0.114 * blue
      const value = mode === 'binary'
        ? (grey > 145 ? 255 : 0)
        : Math.max(0, Math.min(255, (grey - 128) * 1.35 + 128))

      imageData.data[index] = value
      imageData.data[index + 1] = value
      imageData.data[index + 2] = value
    }
    context.putImageData(imageData, 0, 0)

    return canvas
  }

  return PLATE_CROP_OFFSETS.flatMap((offsetRatio) => [
    createCrop('color', offsetRatio),
    createCrop('grey', offsetRatio),
    createCrop('binary', offsetRatio),
  ])
}

export function StaffGateCameraScanner({ gate, onUsePlate }: StaffGateCameraScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const workerRef = useRef<Worker | null>(null)
  const mountedRef = useRef(true)
  const [cameraActive, setCameraActive] = useState(false)
  const [snapshotUrl, setSnapshotUrl] = useState('')
  const [plateInput, setPlateInput] = useState('')
  const [ocrProgress, setOcrProgress] = useState(0)
  const [ocrConfidence, setOcrConfidence] = useState<number>()
  const [isRecognizing, setIsRecognizing] = useState(false)
  const [error, setError] = useState<string>()
  const isEntry = gate === 'entry'
  const normalizedPlate = normalizePlate(plateInput)

  useEffect(() => {
    mountedRef.current = true

    return () => {
      mountedRef.current = false
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
      void workerRef.current?.terminate()
      workerRef.current = null
    }
  }, [])

  async function getOcrWorker() {
    if (workerRef.current) return workerRef.current

    const { createWorker, PSM } = await import('tesseract.js')
    const worker = await createWorker('eng', 1, {
      logger: ({ progress, status }) => {
        if (mountedRef.current && status === 'recognizing text') {
          setOcrProgress(Math.round(progress * 100))
        }
      },
    })
    await worker.setParameters({
      tessedit_pageseg_mode: PSM.SINGLE_LINE,
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-.',
      preserve_interword_spaces: '0',
    })
    workerRef.current = worker
    return worker
  }

  async function startCamera() {
    setError(undefined)
    setSnapshotUrl('')
    setOcrConfidence(undefined)
    setOcrProgress(0)

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      setCameraActive(true)
    } catch {
      setError('Không mở được camera. Hãy kiểm tra quyền camera hoặc sử dụng HTTPS/localhost.')
    }
  }

  function stopCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraActive(false)
  }

  async function captureAndRecognize() {
    const video = videoRef.current
    if (!video || !video.videoWidth || !video.videoHeight || isRecognizing) return

    const snapshotCanvas = document.createElement('canvas')
    snapshotCanvas.width = video.videoWidth
    snapshotCanvas.height = video.videoHeight
    snapshotCanvas.getContext('2d')?.drawImage(video, 0, 0)
    setSnapshotUrl(snapshotCanvas.toDataURL('image/jpeg', 0.9))

    const plateCrops = createPlateCrops(video)
    stopCamera()
    setError(undefined)
    setOcrConfidence(undefined)
    setOcrProgress(0)
    setIsRecognizing(true)

    try {
      const worker = await getOcrWorker()
      const candidates: OcrCandidate[] = []

      for (const plateCrop of plateCrops) {
        const { data } = await worker.recognize(plateCrop)
        for (const candidateValue of getPlateCandidateValues(data.text)) {
          candidates.push(scoreCandidate(candidateValue, data.confidence))
        }
      }

      const bestCandidate = candidates.sort((first, second) => second.score - first.score)[0]
      const recognizedPlate = formatRecognizedPlate(bestCandidate.plate)

      if (!recognizedPlate || recognizedPlate.length < 4) {
        setError('Camera chưa đọc được biển số. Hãy chụp lại gần hơn hoặc nhập biển số thủ công.')
        return
      }

      setPlateInput(recognizedPlate)
      setOcrConfidence(Math.round(bestCandidate.confidence))
    } catch {
      setError('Không thể nhận diện biển số lúc này. Staff vẫn có thể nhập biển số thủ công.')
    } finally {
      if (mountedRef.current) setIsRecognizing(false)
    }
  }

  function handleUsePlate() {
    if (normalizedPlate.length < 4) return
    onUsePlate(normalizedPlate)
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-theme bg-black text-white shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${cameraActive ? 'animate-pulse bg-emerald-400' : 'bg-zinc-500'}`} />
          <div>
            <p className="text-xs font-bold">Camera cổng {isEntry ? 'vào' : 'ra'}</p>
            <p className="mt-0.5 text-[10px] text-white/45">Webcam trình duyệt · tự nhận diện bằng Tesseract OCR</p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/55">
          {isRecognizing ? `Đang nhận diện ${ocrProgress}%` : cameraActive ? 'Camera đang mở' : snapshotUrl ? 'Đã chụp ảnh' : 'Chưa mở camera'}
        </span>
      </div>

      <div className="relative flex min-h-64 items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-950 to-black">
        <video ref={videoRef} muted playsInline className={`absolute inset-0 h-full w-full object-cover ${cameraActive ? 'block' : 'hidden'}`} />
        {snapshotUrl && !cameraActive && <img src={snapshotUrl} alt="Ảnh phương tiện vừa chụp" className="absolute inset-0 h-full w-full object-cover" />}
        {!cameraActive && !snapshotUrl && <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/40">Mở camera để chụp biển số</p>}

        {(cameraActive || snapshotUrl) && (
          <div className="pointer-events-none absolute left-1/2 top-1/2 h-[46%] w-[82%] -translate-x-1/2 -translate-y-1/2 rounded-lg border-2 border-dashed border-sky-300/80">
            <span className="absolute -left-0.5 -top-0.5 size-5 border-l-2 border-t-2 border-sky-300" />
            <span className="absolute -right-0.5 -top-0.5 size-5 border-r-2 border-t-2 border-sky-300" />
            <span className="absolute -bottom-0.5 -left-0.5 size-5 border-b-2 border-l-2 border-sky-300" />
            <span className="absolute -bottom-0.5 -right-0.5 size-5 border-b-2 border-r-2 border-sky-300" />
          </div>
        )}
      </div>

      <div className="grid gap-3 border-t border-white/10 bg-white/5 p-4 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Biển số camera đọc được</p>
          <p className={`mt-1 text-lg font-black uppercase tracking-[0.08em] ${plateInput ? 'text-white' : 'text-white/30'}`}>
            {plateInput || 'Chưa có biển số'}
          </p>
          {isRecognizing ? (
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-sky-400 transition-all" style={{ width: `${ocrProgress}%` }} />
            </div>
          ) : ocrConfidence !== undefined ? (
            <p className={`mt-1 text-[10px] ${ocrConfidence >= 70 ? 'text-emerald-300' : 'text-amber-300'}`}>
              Độ tin cậy OCR: {ocrConfidence}%. Nếu sai, sửa ở ô tra cứu bên dưới.
            </p>
          ) : (
            <p className="mt-1 text-[10px] text-white/45">Kết quả sẽ được đưa vào ô tra cứu chính, không check-in/out trực tiếp.</p>
          )}
          {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
        </div>

        {!cameraActive ? (
          <button type="button" onClick={() => void startCamera()} disabled={isRecognizing} className="h-11 rounded-xl border border-white/15 bg-white/10 px-5 text-xs font-bold text-white hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40">
            {snapshotUrl ? 'Chụp lại ảnh' : 'Mở camera'}
          </button>
        ) : (
          <button type="button" onClick={() => void captureAndRecognize()} className="h-11 rounded-xl border border-white/15 bg-white/10 px-5 text-xs font-bold text-white hover:bg-white/15">
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
