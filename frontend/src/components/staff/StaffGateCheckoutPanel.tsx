import type { Floor } from '../../services/managerBuildingsApi'
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
  floorMap: Map<string, Floor>
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
  floorMap,
  onQueryChange,
  onCheckoutCash,
  onCheckoutTransfer,
}: StaffGateCheckoutPanelProps) {
  const amountToCollect = preview?.toCollect ?? session?.fee ?? 0
  const hasPrepaidBooking = Boolean(preview?.bookingId)

  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <div className="flex flex-col gap-2 border-b border-theme pb-4">
        <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Xe ra</p>
        <h2 className="text-xl font-semibold text-fg">Tra cứu và ghi nhận xe ra</h2>
        <p className="text-sm text-muted">
          Tìm phiên gửi xe, kiểm tra số tiền còn phải thu rồi xác nhận xe ra.
        </p>
      </div>

      <div className="mt-5 grid gap-4">
        <StaffGateField label="Biển số / mã phiên">
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Nhập biển số hoặc mã phiên"
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
              <span className="w-fit rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-200">
                Đang gửi
              </span>
            </div>

            <dl className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
              <Detail label="Loại khách" value={formatCustomerType(session.customerType)} />
              <Detail label="Loại xe" value={formatVehicleType(session.vehicleType)} />
              <Detail label="Vị trí" value={formatSessionSpot(session, floorMap)} />
              <Detail label="Giờ vào" value={formatGateTime(session.entryTime)} />
              <Detail
                label="Cần thu thêm"
                value={isPreviewLoading ? 'Đang tính...' : formatStaffCurrency(amountToCollect)}
              />
              <Detail
                label="Trạng thái"
                value={amountToCollect === 0 ? 'Không cần thu thêm' : 'Chờ thanh toán'}
              />
              {hasPrepaidBooking && (
                <>
                  <Detail label="Đặt chỗ đã trả trước" value={formatStaffCurrency(preview?.prepaidAmount ?? 0)} />
                  <Detail
                    label="Phí quá giờ"
                    value={`${preview?.overtimeHours ?? 0} giờ / ${formatStaffCurrency(preview?.overtimeFee ?? 0)}`}
                  />
                </>
              )}
            </dl>

            {preview?.note && (
              <p className="mt-4 rounded-lg border border-theme bg-page p-3 text-xs text-muted">{preview.note}</p>
            )}

            <div className={`mt-5 grid gap-3 ${amountToCollect > 0 ? 'sm:grid-cols-2' : ''}`}>
              {amountToCollect > 0 && (
                <button
                  type="button"
                  onClick={() => onCheckoutCash(session)}
                  disabled={isSubmitting || isPreviewLoading}
                  className="h-11 rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Thu tiền mặt {formatStaffCurrency(amountToCollect)}
                </button>
              )}
              <button
                type="button"
                onClick={() => onCheckoutTransfer(session)}
                disabled={isSubmitting || isPreviewLoading}
                className="h-11 rounded-lg border border-theme bg-badge px-4 text-sm font-semibold text-fg hover:bg-ghost disabled:cursor-not-allowed disabled:opacity-60"
              >
                {amountToCollect > 0 ? `Chuyển khoản ${formatStaffCurrency(amountToCollect)}` : 'Xác nhận xe ra'}
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

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-subtle">{label}</dt>
      <dd className="mt-1 font-medium text-fg">{value}</dd>
    </div>
  )
}
