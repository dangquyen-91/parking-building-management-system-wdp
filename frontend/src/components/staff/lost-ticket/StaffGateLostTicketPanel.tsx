import { useState } from 'react'
import type { GateSession } from '../../../services/staffGateApi'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Label } from '../../ui/label'
import { Textarea } from '../../ui/textarea'
import { formatStaffCurrency } from '../data/staffGateUi'

type LostTicketMethod = 'cash' | 'transfer'

type StaffGateLostTicketPanelProps = {
  session?: GateSession
  isSubmitting: boolean
  onCheckoutLostTicket: (session: GateSession, method: LostTicketMethod, note?: string) => void
}

const LOST_TICKET_FINE = 100000

export function StaffGateLostTicketPanel({
  session,
  isSubmitting,
  onCheckoutLostTicket,
}: StaffGateLostTicketPanelProps) {
  const [expanded, setExpanded] = useState(false)
  const [method, setMethod] = useState<LostTicketMethod>('cash')
  const [note, setNote] = useState('')
  const [confirmed, setConfirmed] = useState(false)

  if (!session || session.customerType === 'resident') return null

  function handleSubmit() {
    if (!session || !confirmed) return
    onCheckoutLostTicket(session, method, note.trim() || undefined)
  }

  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardDescription>Ngoại lệ</CardDescription>
          <CardTitle>Khách mất vé / mất QR</CardTitle>
          <CardDescription>
            Dùng khi khách vãng lai không còn vé QR. Cần đối chiếu giấy tờ xe trước khi xử lý.
          </CardDescription>
        </div>
        <Button type="button" variant="outline" onClick={() => setExpanded((value) => !value)}>
          {expanded ? 'Ẩn' : 'Xử lý'}
        </Button>
      </CardHeader>

      {expanded && (
        <CardContent className="grid gap-4">
          <div className="grid gap-3 rounded-lg border bg-muted/30 p-4 sm:grid-cols-3">
            <Info label="Biển số" value={session.licensePlate} />
            <Info label="Phí phạt mất vé" value={formatStaffCurrency(LOST_TICKET_FINE)} />
            <Info label="Loại khách" value="Khách vãng lai" />
          </div>

          <Label className="grid gap-2 text-sm">
            Ghi chú xử lý
            <Textarea
              value={note}
              onChange={(event) => setNote(event.target.value)}
              rows={3}
              placeholder="VD: Khách báo mất vé, đã đối chiếu giấy tờ xe và biển số."
            />
          </Label>

          <div className="grid gap-3 sm:grid-cols-2">
            <MethodButton
              active={method === 'cash'}
              label="Thu tiền mặt"
              detail="Đóng phiên ngay sau khi xác nhận."
              onClick={() => setMethod('cash')}
            />
            <MethodButton
              active={method === 'transfer'}
              label="Chuyển khoản"
              detail="Tạo QR PayOS gồm tiền gửi xe và phạt."
              onClick={() => setMethod('transfer')}
            />
          </div>

          <Label className="flex items-start gap-3 rounded-lg border bg-muted/30 p-3 text-xs">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(event) => setConfirmed(event.target.checked)}
              className="mt-0.5 size-4"
            />
            <span>
              Tôi đã đối chiếu giấy tờ xe, biển số camera và xác nhận đúng chủ xe trước khi xử lý mất vé.
            </span>
          </Label>

          <Button type="button" onClick={handleSubmit} disabled={isSubmitting || !confirmed}>
            {isSubmitting
              ? 'Đang xử lý...'
              : method === 'cash'
                ? 'Xác nhận mất vé và thu tiền mặt'
                : 'Tạo QR thanh toán mất vé'}
          </Button>
        </CardContent>
      )}
    </Card>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  )
}

function MethodButton({
  active,
  label,
  detail,
  onClick,
}: {
  active: boolean
  label: string
  detail: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant={active ? 'default' : 'outline'}
      onClick={onClick}
      className="h-auto justify-start px-4 py-4 text-left"
    >
      <span>
        <span className="block text-sm font-semibold">{label}</span>
        <span className="mt-1 block text-xs opacity-75">{detail}</span>
      </span>
    </Button>
  )
}

export type { LostTicketMethod }
