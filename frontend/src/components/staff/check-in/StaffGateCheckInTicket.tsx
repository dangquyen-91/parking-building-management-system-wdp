import { useEffect, useState, type ReactNode } from 'react'
import { CarFront, Check, CheckCircle2, Clock3, Hash, Printer, QrCode, UserRound } from 'lucide-react'
import QRCode from 'qrcode'
import type { GateSession } from '../../../services/staffGateApi'
import { Button } from '../../ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../ui/dialog'
import { formatGateTime } from '../data/staffGateUi'
import { formatCustomerType, formatVehicleType } from '../data/staffGateUtils'

type StaffGateCheckInTicketProps = {
  session: GateSession
  qrValue?: string
  onClose: () => void
}

export function StaffGateCheckInTicket({ session, qrValue, onClose }: StaffGateCheckInTicketProps) {
  const [qrDataUrl, setQrDataUrl] = useState('')

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
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-h-[calc(100vh-2rem)] gap-0 overflow-y-auto rounded-3xl p-0 shadow-2xl sm:max-w-3xl">
        <DialogHeader className="relative overflow-hidden border-b border-emerald-500/20 bg-gradient-to-br from-emerald-500/20 via-background to-sky-500/10 p-6 pr-14 text-left md:p-8 md:pr-16">
          <div className="pointer-events-none absolute -right-10 -top-16 size-44 rounded-full bg-emerald-400/20 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-lg shadow-emerald-500/25">
              <CheckCircle2 className="size-6" />
            </span>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700 dark:text-emerald-300">
                Check-in thành công
              </p>
              <DialogTitle className="mt-2 text-2xl font-bold md:text-3xl">Vé gửi xe đã được tạo</DialogTitle>
              <DialogDescription className="mt-2 max-w-xl leading-6">
                Giao vé QR này cho khách giữ và quét lại khi làm thủ tục xe ra.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="grid gap-6 p-6 md:grid-cols-[18rem_minmax(0,1fr)] md:p-8">
          <div className="grid content-start gap-3">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-2xl border bg-white p-4 shadow-sm ring-4 ring-slate-950/[0.025]">
              <span className="absolute left-3 top-3 size-5 rounded-tl-lg border-l-2 border-t-2 border-emerald-500" />
              <span className="absolute right-3 top-3 size-5 rounded-tr-lg border-r-2 border-t-2 border-emerald-500" />
              <span className="absolute bottom-3 left-3 size-5 rounded-bl-lg border-b-2 border-l-2 border-emerald-500" />
              <span className="absolute bottom-3 right-3 size-5 rounded-br-lg border-b-2 border-r-2 border-emerald-500" />
              {qrDataUrl ? (
                <img src={qrDataUrl} alt={`Mã QR vé xe ${session.licensePlate}`} className="size-full object-contain" />
              ) : (
                <p className="text-xs text-zinc-500">Đang tạo QR...</p>
              )}
            </div>
            <p className="flex items-center justify-center gap-2 text-center text-xs text-muted-foreground">
              <QrCode className="size-4" /> Quét mã này khi làm thủ tục xe ra
            </p>
          </div>

          <div className="min-w-0">
            <div className="rounded-2xl border border-sky-500/20 bg-gradient-to-br from-sky-500/10 to-transparent p-5">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-sky-700 dark:text-sky-300">Biển số xe</p>
              <p className="mt-2 break-words text-3xl font-black tracking-[0.1em] sm:text-4xl">{session.licensePlate}</p>
              <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/25 bg-emerald-500/10 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                <Check className="size-3.5" /> Đã ghi nhận vào bãi
              </span>
            </div>

            <dl className="mt-4 grid gap-3 sm:grid-cols-2">
              <TicketDetail icon={<Clock3 className="size-4" />} label="Thời gian vào" value={formatGateTime(session.entryTime)} />
              <TicketDetail icon={<CarFront className="size-4" />} label="Loại xe" value={formatVehicleType(session.vehicleType)} />
              <TicketDetail icon={<UserRound className="size-4" />} label="Loại khách" value={formatCustomerType(session.customerType)} />
              <TicketDetail icon={<Hash className="size-4" />} label="Mã phiên" value={session._id} compact />
            </dl>
          </div>
        </div>

        <DialogFooter className="m-0 rounded-none px-6 py-4 md:px-8">
          <Button type="button" variant="outline" onClick={() => window.print()} className="h-11 rounded-xl px-5">
            <Printer className="size-4" />
            In vé QR
          </Button>
          <Button type="button" onClick={onClose} className="h-11 rounded-xl bg-emerald-600 px-6 font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-700">
            <Check className="size-4" />
            Hoàn tất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TicketDetail({
  label,
  value,
  icon,
  compact = false,
}: {
  label: string
  value: string
  icon: ReactNode
  compact?: boolean
}) {
  return (
    <div className="min-w-0 rounded-xl border bg-muted/25 p-3.5">
      <dt className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</dt>
      <dd className={`mt-1.5 font-semibold ${compact ? 'truncate font-mono text-xs' : ''}`} title={compact ? value : undefined}>{value}</dd>
    </div>
  )
}
