import type { GateCheckoutPreview, GateSession } from '../../services/staffGateApi'
import { StaffGateField } from './StaffGateField'
import { formatGateTime, formatStaffCurrency } from './staffGateData'
import { formatCustomerType, formatSessionSpot, formatVehicleType } from './staffGateUtils'

type StaffGateCheckoutPanelProps = {
  query: string
  session?: GateSession
  preview: GateCheckoutPreview | null
  isPreviewLoading: boolean
  isSubmitting: boolean
  onQueryChange: (value: string) => void
  onCheckoutCash: (session: GateSession) => void
  onCheckoutTransfer: (session: GateSession) => void
}

export function StaffGateCheckoutPanel({
  query,
  session,
  preview,
  isPreviewLoading,
  isSubmitting,
  onQueryChange,
  onCheckoutCash,
  onCheckoutTransfer,
}: StaffGateCheckoutPanelProps) {
  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <div className="flex flex-col gap-2 border-b border-theme pb-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Xe ra</p>
        <h2 className="text-xl font-semibold text-fg">Tra cứu và ghi nhận xe ra</h2>
        <p className="text-sm text-muted">
          Tìm phiên gửi xe đang hoạt động, xem phí tạm tính, rồi xác nhận thu tiền mặt hoặc tạo link chuyển khoản.
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <StaffGateField label="Biển số / mã phiên">
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Nhập 59X2 hoặc mã phiên"
            className="auth-input h-11 rounded-lg border px-3 text-sm font-semibold uppercase text-fg"
          />
        </StaffGateField>

        {session ? (
          <div className="rounded-lg border border-theme bg-badge p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-fg">{session.licensePlate}</p>
                <p className="mt-1 text-xs text-subtle">{session._id}</p>
              </div>
              <span className="w-fit rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-200">
                Đang gửi
              </span>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-subtle">Loại khách</dt>
                <dd className="mt-1 font-medium text-fg">{formatCustomerType(session.customerType)}</dd>
              </div>
              <div>
                <dt className="text-subtle">Loại xe</dt>
                <dd className="mt-1 font-medium text-fg">{formatVehicleType(session.vehicleType)}</dd>
              </div>
              <div>
                <dt className="text-subtle">Vị trí</dt>
                <dd className="mt-1 font-medium text-fg">{formatSessionSpot(session)}</dd>
              </div>
              <div>
                <dt className="text-subtle">Giờ vào</dt>
                <dd className="mt-1 font-medium text-fg">{formatGateTime(session.entryTime)}</dd>
              </div>
              <div>
                <dt className="text-subtle">Tạm tính</dt>
                <dd className="mt-1 font-medium text-fg">
                  {isPreviewLoading ? 'Đang tính...' : formatStaffCurrency(preview?.fee ?? session.fee ?? 0)}
                </dd>
              </div>
              <div>
                <dt className="text-subtle">Thanh toán</dt>
                <dd className="mt-1 font-medium text-fg">{session.paymentStatus}</dd>
              </div>
            </dl>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => onCheckoutCash(session)}
                disabled={isSubmitting}
                className="h-11 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                Thu tiền mặt
              </button>
              <button
                type="button"
                onClick={() => onCheckoutTransfer(session)}
                disabled={isSubmitting}
                className="h-11 rounded-lg border border-theme bg-badge px-4 text-sm font-semibold text-fg transition-colors hover:bg-ghost disabled:cursor-not-allowed disabled:opacity-60"
              >
                Chuyển khoản
              </button>
            </div>
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
