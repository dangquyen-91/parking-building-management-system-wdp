import type { ManagerIncident } from '../../../services/managerIncidentsApi'
import { ManagerLostTicketCard } from './ManagerLostTicketCard'

type ManagerLostTicketListProps = {
  incidents: ManagerIncident[]
  isLoading: boolean
}

export function ManagerLostTicketList({ incidents, isLoading }: ManagerLostTicketListProps) {
  if (isLoading) {
    return (
      <div className="rounded-3xl border border-theme bg-badge p-8 text-center text-sm font-semibold text-muted">
        Đang tải danh sách mất vé...
      </div>
    )
  }

  if (incidents.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-theme bg-badge p-12 text-center">
        <p className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-theme bg-page text-2xl font-black text-fg">
          ✓
        </p>
        <h2 className="mt-4 text-xl font-black text-fg">Chưa có ca mất vé phù hợp</h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted">
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
