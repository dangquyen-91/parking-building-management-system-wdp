import { Badge } from '../../ui/badge'
import { Button } from '../../ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { formatGateTime, visitorTypeLabel, type ParkingTicket } from '../data/staffGateUi'

type StaffActiveTicketsProps = {
  tickets: ParkingTicket[]
  selectedTicketId?: string
  onSelectTicket: (ticket: ParkingTicket) => void
}

export function StaffActiveTickets({
  tickets,
  selectedTicketId,
  onSelectTicket,
}: StaffActiveTicketsProps) {
  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardDescription>Trong bãi</CardDescription>
          <CardTitle>Xe đang gửi</CardTitle>
        </div>
        <Badge variant="secondary">{tickets.length} xe</Badge>
      </CardHeader>

      <CardContent className="grid gap-2">
        {tickets.map((ticket) => {
          const selected = selectedTicketId === ticket.id

          return (
            <Button
              key={ticket.id}
              type="button"
              variant={selected ? 'default' : 'outline'}
              onClick={() => onSelectTicket(ticket)}
              className="h-auto justify-between px-3 py-3 text-left"
            >
              <span>
                <span className="block text-sm font-semibold">{ticket.plate}</span>
                <span className="mt-1 block text-xs opacity-75">
                  {ticket.slot} / {visitorTypeLabel[ticket.visitorType]}
                </span>
              </span>
              <span className="text-xs opacity-75">{formatGateTime(ticket.checkInAt)}</span>
            </Button>
          )
        })}
      </CardContent>
    </Card>
  )
}
