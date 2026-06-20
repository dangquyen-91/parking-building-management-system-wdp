import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import type { GateSession } from '../../services/staffGateApi'
import { formatGateTime } from './staffGateData'
import { formatCustomerType, formatVehicleType } from './staffGateUtils'

type StaffGateCheckInTicketProps = {
  session: GateSession
  qrValue?: string
  onClose: () => void
}

export function StaffGateCheckInTicket({ session, qrValue, onClose }: StaffGateCheckInTicketProps) {
  const [qrDataUrl, setQrDataUrl] = useState('')
  const [message, setMessage] = useState<string>()

  useEffect(() => {
    let ignore = false
    const token = qrValue || JSON.stringify({
      type: 'parking-session-ticket',
      sessionId: session._id,
      licensePlate: session.licensePlate,
    })

    void QRCode.toDataURL(token, { width: 240, margin: 1 }).then((url) => {
      if (!ignore) setQrDataUrl(url)
    })

    return () => {
      ignore = true
    }
  }, [qrValue, session])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm" role="dialog" aria-modal="true">
      <section className="w-full max-w-xl overflow-hidden rounded-3xl border border-theme bg-page shadow-2xl">
        <div className="border-b border-emerald-500/20 bg-gradient-to-r from-emerald-500/20 via-transparent to-transparent p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-600 dark:text-emerald-300">Check-in thành công</p>
              <h2 className="mt-2 text-2xl font-black text-fg">Vé gửi xe đã được tạo</h2>
              <p className="mt-1 text-sm text-muted">Giao vé QR này cho khách để đối chiếu tại cổng ra.</p>
            </div>
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-lg font-black text-white">✓</span>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-[14rem_minmax(0,1fr)] md:p-6">
          <div className="flex min-h-56 items-center justify-center rounded-2xl border border-theme bg-white p-3">
            {qrDataUrl ? <img src={qrDataUrl} alt={`Mã QR vé xe ${session.licensePlate}`} className="size-full object-contain" /> : <p className="text-xs text-zinc-500">Đang tạo QR...</p>}
          </div>

          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">Biển số xe</p>
            <p className="mt-1 text-3xl font-black tracking-[0.1em] text-fg">{session.licensePlate}</p>
            <dl className="mt-5 grid gap-3 text-sm">
              <TicketDetail label="Vào lúc" value={formatGateTime(session.entryTime)} />
              <TicketDetail label="Loại xe" value={formatVehicleType(session.vehicleType)} />
              <TicketDetail label="Loại khách" value={formatCustomerType(session.customerType)} />
              <TicketDetail label="Mã phiên" value={session._id} />
            </dl>
          </div>
        </div>

        {message && <p className="mx-5 mb-4 rounded-xl border border-sky-500/25 bg-sky-500/10 p-3 text-xs text-fg md:mx-6">{message}</p>}

        <div className="grid gap-3 border-t border-theme p-5 sm:grid-cols-3">
          <button type="button" onClick={() => window.print()} className="h-11 rounded-xl border border-theme bg-badge px-4 text-xs font-bold text-fg hover:bg-ghost">
            In vé QR
          </button>
          <button type="button" onClick={() => setMessage('Mô phỏng: vé QR đã được gửi tới số điện thoại của khách.')} className="h-11 rounded-xl border border-theme bg-badge px-4 text-xs font-bold text-fg hover:bg-ghost">
            Gửi SMS
          </button>
          <button type="button" onClick={onClose} className="h-11 rounded-xl bg-emerald-600 px-4 text-xs font-bold text-white hover:bg-emerald-500">
            Hoàn tất
          </button>
        </div>
      </section>
    </div>
  )
}

function TicketDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] font-semibold uppercase tracking-[0.1em] text-subtle">{label}</dt>
      <dd className="mt-1 break-all font-semibold text-fg">{value}</dd>
    </div>
  )
}
