import type { ManagerIncident } from '../../../services/managerIncidentsApi'
import { ManagerLostTicketCard } from './ManagerLostTicketCard'

type ManagerLostTicketListProps = {
  incidents: ManagerIncident[]
  isLoading: boolean
}

export function ManagerLostTicketList({ incidents, isLoading }: ManagerLostTicketListProps) {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center text-sm font-semibold text-muted-foreground">
        Đang tải danh sách mất vé...
      </div>
    )
  }

  if (incidents.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-border bg-card p-12 text-center">
        <p className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-border bg-background text-2xl font-black text-foreground">
          ✓
        </p>
        <h2 className="mt-4 text-xl font-black text-foreground">Chưa có ca mất vé phù hợp</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">
          Khi staff xử lý khách mất vé hoặc mất QR, danh sách sẽ xuất hiện tại đây để manager kiểm tra.
        </p>
      </div>
    )
  }

  return (
    <section className="grid gap-4">
      {incidents.map((incident) => (
        <ManagerLostTicketCard key={incident._id} incident={incident} />
      ))}
    </section>
  )
}


