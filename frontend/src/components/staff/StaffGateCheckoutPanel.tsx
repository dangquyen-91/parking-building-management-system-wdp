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
        <h2 className="text-xl font-semibold text-fg">Tra cuu va checkout</h2>
        <p className="text-sm text-muted">
          Tim session dang active, xem phi tam tinh, roi xac nhan thu tien mat hoac tao link chuyen khoan.
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <StaffGateField label="Bien so / ma session">
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Nhap 59X2 hoac session id"
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
                Dang gui
              </span>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-subtle">Loai khach</dt>
                <dd className="mt-1 font-medium text-fg">{formatCustomerType(session.customerType)}</dd>
              </div>
              <div>
                <dt className="text-subtle">Loai xe</dt>
                <dd className="mt-1 font-medium text-fg">{formatVehicleType(session.vehicleType)}</dd>
              </div>
              <div>
                <dt className="text-subtle">Vi tri</dt>
                <dd className="mt-1 font-medium text-fg">{formatSessionSpot(session)}</dd>
              </div>
              <div>
                <dt className="text-subtle">Gio vao</dt>
                <dd className="mt-1 font-medium text-fg">{formatGateTime(session.entryTime)}</dd>
              </div>
              <div>
                <dt className="text-subtle">Tam tinh</dt>
                <dd className="mt-1 font-medium text-fg">
                  {isPreviewLoading ? 'Dang tinh...' : formatStaffCurrency(preview?.fee ?? session.fee ?? 0)}
                </dd>
              </div>
              <div>
                <dt className="text-subtle">Thanh toan</dt>
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
                Thu tien mat
              </button>
              <button
                type="button"
                onClick={() => onCheckoutTransfer(session)}
                disabled={isSubmitting}
                className="h-11 rounded-lg border border-theme bg-badge px-4 text-sm font-semibold text-fg transition-colors hover:bg-ghost disabled:cursor-not-allowed disabled:opacity-60"
              >
                Chuyen khoan
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-lg border border-theme bg-badge p-5 text-sm text-muted">
            Chua co xe dang gui khop voi thong tin tim kiem.
          </div>
        )}
      </div>
    </section>
  )
}
