import type { ManagerIncident } from '../../../services/managerIncidentsApi'
import {
  formatLostTicketCurrency,
  formatLostTicketDateTime,
  getIncidentSession,
  getIncidentStaffName,
  getIncidentVehicleType,
  LOST_TICKET_VEHICLE_LABELS,
} from './managerLostTicketUi'

type ManagerLostTicketCardProps = {
  incident: ManagerIncident
}

export function ManagerLostTicketCard({ incident }: ManagerLostTicketCardProps) {
  const session = getIncidentSession(incident)
  const vehicleType = getIncidentVehicleType(incident)
  const totalSessionFee = session?.fee ?? 0
  const lostTicketFine = incident.fineAmount || 0
  const parkingFee = Math.max(totalSessionFee - lostTicketFine, 0)

  return (
    <article className="bg-card text-card-foreground ring-1 ring-border overflow-hidden rounded-3xl border border-border">
      <div className="grid gap-0 lg:grid-cols-[minmax(240px,0.85fr)_minmax(360px,1.15fr)_minmax(260px,0.85fr)]">
        <section className="flex flex-col justify-between gap-5 border-b border-border bg-gradient-to-br from-amber-500/12 via-transparent to-sky-500/10 p-5 lg:border-b-0 lg:border-r">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3 py-1 text-xs font-black text-amber-700 dark:text-amber-100">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Mất vé
            </div>
            <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Biển số xe</p>
            <h2 className="mt-2 text-3xl font-black tracking-[0.08em] text-foreground">{incident.licensePlate}</h2>
          </div>

          <div className="space-y-1 text-sm">
            <p className="font-bold text-foreground">{vehicleType ? LOST_TICKET_VEHICLE_LABELS[vehicleType] : 'Không xác định loại xe'}</p>
            <p className="text-muted-foreground">Ghi nhận {formatLostTicketDateTime(incident.createdAt)}</p>
          </div>
        </section>

        <section className="p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Thông tin xử lý</p>
              <h3 className="mt-1 text-xl font-black text-foreground">{getIncidentStaffName(incident.staffId)}</h3>
              <p className="mt-1 text-sm text-muted-foreground">Nhân viên tiếp nhận ca mất vé</p>
            </div>
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <Info label="Giờ vào" value={formatLostTicketDateTime(session?.entryTime)} />
            <Info label="Giờ ra" value={formatLostTicketDateTime(session?.exitTime)} />
            <Info label="Mã phiên" value={session?._id ?? 'Không có'} wide />
          </dl>

          <div className="mt-4 rounded-2xl border border-border bg-card p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Ghi chú</p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              {incident.description || 'Staff đã đối chiếu giấy tờ và xử lý theo luồng mất vé.'}
            </p>
          </div>
        </section>

        <section className="border-t border-border bg-background/35 p-5 lg:border-l lg:border-t-0">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-muted-foreground">Chi tiết phí</p>

          <div className="mt-4 space-y-3">
            <FeeLine label="Phí gửi xe" value={parkingFee} />
            <FeeLine label="Phí phạt mất vé" value={lostTicketFine} highlight />
          </div>

          <div className="mt-4 rounded-3xl border border-sky-400/30 bg-sky-500/10 p-5">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted-foreground">Tổng phí phiên</p>
            <p className="mt-2 text-3xl font-black text-foreground">{formatLostTicketCurrency(totalSessionFee)}</p>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Tổng phí phiên là số tiền BE ghi nhận khi checkout. Manager xem nhanh phần phí gửi xe và phí phạt đã được tách riêng.
          </p>
        </section>
      </div>
    </article>
  )
}

function Info({ label, value, wide = false }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className={['rounded-2xl border border-border bg-card p-4', wide ? 'sm:col-span-2' : ''].join(' ')}>
      <dt className="text-[10px] font-black uppercase tracking-[0.14em] text-muted-foreground">{label}</dt>
      <dd className="mt-1 break-words text-sm font-bold text-foreground">{value}</dd>
    </div>
  )
}

function FeeLine({ label, value, highlight = false }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div
      className={[
        'flex items-center justify-between gap-4 rounded-2xl border px-4 py-3',
        highlight ? 'border-amber-400/40 bg-amber-500/10' : 'border-border bg-card',
      ].join(' ')}
    >
      <p className="text-sm font-bold text-muted-foreground">{label}</p>
      <p className="text-base font-black text-foreground">{formatLostTicketCurrency(value)}</p>
    </div>
  )
}


