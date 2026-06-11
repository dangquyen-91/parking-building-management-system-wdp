import {
  calculateMotorbikeFee,
  formatGateTime,
  visitorTypeLabel,
  type ParkingTicket,
} from './staffGateData'
import { StaffGateField } from './StaffGateField'

type StaffCheckOutPanelProps = {
  query: string
  ticket?: ParkingTicket
  onQueryChange: (value: string) => void
  onCheckout: (ticketId: string) => void
}

export function StaffCheckOutPanel({
  query,
  ticket,
  onQueryChange,
  onCheckout,
}: StaffCheckOutPanelProps) {
  const estimate = ticket ? calculateMotorbikeFee(ticket.checkInAt) : undefined

  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <div className="flex flex-col gap-2 border-b border-theme pb-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Xe ra</p>
        <h2 className="text-xl font-semibold text-fg">Tra cứu và ghi nhận xe ra</h2>
        <p className="text-sm text-muted">
          Tìm bằng biển số hoặc mã vé, đối chiếu thông tin rồi xác nhận xe đã ra khỏi bãi.
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <StaffGateField label="Biển số / mã vé">
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Nhập 59X2 hoặc PK-MOTO"
            className="auth-input h-11 rounded-lg border px-3 text-sm font-semibold uppercase text-fg"
          />
        </StaffGateField>

        {ticket ? (
          <div className="rounded-lg border border-theme bg-badge p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-fg">{ticket.plate}</p>
                <p className="mt-1 text-xs text-subtle">{ticket.id}</p>
              </div>
              <span className="w-fit rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
                Đang gửi
              </span>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-subtle">Loại khách</dt>
                <dd className="mt-1 font-medium text-fg">{visitorTypeLabel[ticket.visitorType]}</dd>
              </div>
              <div>
                <dt className="text-subtle">Vị trí</dt>
                <dd className="mt-1 font-medium text-fg">{ticket.slot}</dd>
              </div>
              <div>
                <dt className="text-subtle">Giờ vào</dt>
                <dd className="mt-1 font-medium text-fg">{formatGateTime(ticket.checkInAt)}</dd>
              </div>
              <div>
                <dt className="text-subtle">Tạm tính</dt>
                <dd className="mt-1 font-medium text-fg">
                  {estimate?.hours}h / {estimate?.fee.toLocaleString('vi-VN')} VND
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={() => onCheckout(ticket.id)}
              className="mt-5 h-11 w-full rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5"
            >
              Xác nhận xe ra
            </button>
          </div>
        ) : (
          <div className="rounded-lg border border-theme bg-badge p-5 text-sm text-muted">
            Chưa có xe đang gửi khớp với thông tin tìm kiếm.
          </div>
        )}
      </div>
    </section>
  )
}

