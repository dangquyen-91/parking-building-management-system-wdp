import { useEffect, useState } from 'react'
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
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogDescription>Check-in thành công</DialogDescription>
          <DialogTitle>Vé gửi xe đã được tạo</DialogTitle>
          <DialogDescription>Giao vé QR này cho khách để đối chiếu tại cổng ra.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 md:grid-cols-[14rem_minmax(0,1fr)]">
          <div className="flex min-h-56 items-center justify-center rounded-lg border bg-white p-3">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt={`Mã QR vé xe ${session.licensePlate}`} className="size-full object-contain" />
            ) : (
              <p className="text-xs text-zinc-500">Đang tạo QR...</p>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Biển số xe</p>
            <p className="mt-1 text-3xl font-bold tracking-[0.1em]">{session.licensePlate}</p>
            <dl className="mt-5 grid gap-3 text-sm">
              <TicketDetail label="Vào lúc" value={formatGateTime(session.entryTime)} />
              <TicketDetail label="Loại xe" value={formatVehicleType(session.vehicleType)} />
              <TicketDetail label="Loại khách" value={formatCustomerType(session.customerType)} />
              <TicketDetail label="Mã phiên" value={session._id} />
            </dl>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => window.print()}>
            In vé QR
          </Button>
          <Button type="button" onClick={onClose}>
            Hoàn tất
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function TicketDetail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-all font-medium">{value}</dd>
    </div>
  )
}
