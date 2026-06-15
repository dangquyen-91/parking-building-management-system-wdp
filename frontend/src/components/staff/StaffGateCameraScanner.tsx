import { useState } from 'react'

type StaffGateCameraScannerProps = {
  gate: 'entry' | 'exit'
  onUsePlate: (plate: string) => void
}

const DEMO_PLATES = {
  entry: '59A-482.16',
  exit: '59X2-481.22',
} as const

export function StaffGateCameraScanner({ gate, onUsePlate }: StaffGateCameraScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [detectedPlate, setDetectedPlate] = useState<string>()
  const isEntry = gate === 'entry'

  function handleDemoScan() {
    setIsScanning(true)
    setDetectedPlate(undefined)

    window.setTimeout(() => {
      setDetectedPlate(DEMO_PLATES[gate])
      setIsScanning(false)
    }, 700)
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-theme bg-black text-white shadow-xl">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex items-center gap-2">
          <span className={`size-2 rounded-full ${isScanning ? 'animate-pulse bg-amber-400' : 'bg-rose-400'}`} />
          <div>
            <p className="text-xs font-bold">Camera cổng {isEntry ? 'vào' : 'ra'}</p>
            <p className="mt-0.5 text-[10px] text-white/45">Bản xem trước giao diện nhận diện biển số</p>
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.12em] text-white/55">
          Chưa kết nối camera thật
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="relative flex min-h-56 items-center justify-center overflow-hidden bg-gradient-to-br from-zinc-800 via-zinc-950 to-black">
          <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,.16)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.16)_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/45 px-3 py-1.5 text-[10px] font-semibold text-white/70 backdrop-blur">
            <span className="size-1.5 rounded-full bg-rose-400" />
            CAM-{isEntry ? 'IN-01' : 'OUT-01'}
          </div>

          <div className="relative flex h-24 w-56 items-center justify-center rounded-lg border-2 border-dashed border-sky-400/70 bg-sky-400/5">
            <span className="absolute -left-0.5 -top-0.5 size-5 border-l-2 border-t-2 border-sky-300" />
            <span className="absolute -right-0.5 -top-0.5 size-5 border-r-2 border-t-2 border-sky-300" />
            <span className="absolute -bottom-0.5 -left-0.5 size-5 border-b-2 border-l-2 border-sky-300" />
            <span className="absolute -bottom-0.5 -right-0.5 size-5 border-b-2 border-r-2 border-sky-300" />
            <p className="text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-white/45">
              {isScanning ? 'Đang nhận diện...' : 'Vùng nhận diện biển số'}
            </p>
          </div>

          {isScanning && <span className="absolute left-1/2 top-1/2 h-px w-56 -translate-x-1/2 animate-pulse bg-sky-300 shadow-[0_0_14px_rgba(125,211,252,1)]" />}
        </div>

        <div className="flex flex-col justify-between border-t border-white/10 bg-white/5 p-4 lg:border-l lg:border-t-0">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-white/40">Kết quả nhận diện</p>
            {detectedPlate ? (
              <>
                <p className="mt-3 text-2xl font-black tracking-[0.12em] text-white">{detectedPlate}</p>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-white/45">Độ tin cậy</span>
                  <span className="font-bold text-emerald-300">98.4%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full w-[98.4%] rounded-full bg-emerald-400" />
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm leading-relaxed text-white/45">
                Đưa biển số vào vùng nhận diện hoặc dùng nút mô phỏng bên dưới.
              </p>
            )}
          </div>

          <div className="mt-5 grid gap-2">
            <button
              type="button"
              onClick={handleDemoScan}
              disabled={isScanning}
              className="h-10 rounded-xl border border-white/15 bg-white/10 px-3 text-xs font-bold text-white hover:bg-white/15 disabled:opacity-60"
            >
              {isScanning ? 'Đang quét...' : detectedPlate ? 'Quét lại' : 'Mô phỏng quét biển số'}
            </button>
            {detectedPlate && (
              <button
                type="button"
                onClick={() => onUsePlate(detectedPlate)}
                className={`h-10 rounded-xl px-3 text-xs font-bold text-white ${isEntry ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-amber-600 hover:bg-amber-500'}`}
              >
                Dùng biển số này →
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
