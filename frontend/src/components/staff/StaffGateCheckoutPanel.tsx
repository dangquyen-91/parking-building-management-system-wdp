import { useState } from 'react'
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

type CheckoutMethod = 'cash' | 'transfer'

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
  const [confirmMethod, setConfirmMethod] = useState<CheckoutMethod | null>(null)
  const amountToCollect = preview?.toCollect ?? session?.fee ?? 0
  const hasPrepaidBooking = Boolean(preview?.bookingId)

  function handleConfirmCheckout() {
    if (!session || !confirmMethod) return

    if (confirmMethod === 'cash') {
      onCheckoutCash(session)
    } else {
      onCheckoutTransfer(session)
    }

    setConfirmMethod(null)
  }

  return (
    <>
      <section className="liquid-glass-card overflow-hidden rounded-2xl">
        <div className="border-b border-theme bg-gradient-to-r from-amber-500/15 via-transparent to-transparent p-5 md:p-6">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-lg font-black text-white shadow-lg shadow-amber-500/20">
              OUT
            </span>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-600 dark:text-amber-300">Quy trình xe ra</p>
              <h2 className="mt-1 text-xl font-bold text-fg">Thanh toán và trả xe</h2>
              <p className="mt-1 text-sm text-muted">Tìm xe đang gửi, kiểm tra chi phí và xác nhận phương tiện rời bãi.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 p-5 md:p-6">
        <StaffGateField label="Biển số / mã phiên">
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Nhập biển số hoặc mã phiên"
            className="auth-input h-14 rounded-xl border px-4 text-lg font-bold uppercase tracking-[0.08em] text-fg"
          />
        </StaffGateField>

        {session ? (
          <div className="overflow-hidden rounded-xl border border-theme bg-badge">
            <div className="border-b border-theme bg-gradient-to-r from-sky-500/10 to-transparent p-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-2xl font-black tracking-[0.08em] text-fg">{session.licensePlate}</p>
                  <p className="mt-1 text-xs text-subtle">Mã phiên: {session._id}</p>
                </div>
                <span className="w-fit rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-200">
                  Đang gửi
                </span>
              </div>
            </div>

            <dl className="grid gap-px bg-[color:var(--border)] sm:grid-cols-2">
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
              <p className="m-4 rounded-lg border border-theme bg-page p-3 text-xs text-muted">{preview.note}</p>
            )}

            <div className={`grid gap-3 border-t border-theme p-4 ${amountToCollect > 0 ? 'sm:grid-cols-2' : ''}`}>
              {amountToCollect > 0 && (
                <button
                  type="button"
                  onClick={() => setConfirmMethod('cash')}
                  disabled={isSubmitting || isPreviewLoading}
                  className="h-14 rounded-xl bg-emerald-600 px-4 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Thu tiền mặt {formatStaffCurrency(amountToCollect)}
                </button>
              )}
              <button
                type="button"
                onClick={() => setConfirmMethod('transfer')}
                disabled={isSubmitting || isPreviewLoading}
                className="h-14 rounded-xl border border-theme-strong bg-btn-primary px-4 text-sm font-bold text-btn-primary-fg shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {amountToCollect > 0 ? `Chuyển khoản ${formatStaffCurrency(amountToCollect)}` : 'Xác nhận xe ra'}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-theme bg-badge p-6 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-ghost text-xl text-muted">⌕</span>
            <p className="mt-3 text-sm font-semibold text-fg">Chưa tìm thấy xe đang gửi</p>
            <p className="mt-1 max-w-sm text-xs text-muted">Nhập biển số hoặc mã phiên để xem thông tin và thực hiện thanh toán.</p>
          </div>
        )}
        </div>
      </section>

      {session && confirmMethod && (
        <CheckoutConfirmationDialog
          session={session}
          method={confirmMethod}
          amount={amountToCollect}
          isSubmitting={isSubmitting}
          onCancel={() => setConfirmMethod(null)}
          onConfirm={handleConfirmCheckout}
        />
      )}
    </>
  )
}

type CheckoutConfirmationDialogProps = {
  session: GateSession
  method: CheckoutMethod
  amount: number
  isSubmitting: boolean
  onCancel: () => void
  onConfirm: () => void
}

function CheckoutConfirmationDialog({
  session,
  method,
  amount,
  isSubmitting,
  onCancel,
  onConfirm,
}: CheckoutConfirmationDialogProps) {
  const isCash = method === 'cash'
  const requiresPayment = amount > 0

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="checkout-confirm-title"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl border border-theme bg-page shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className={[
          'border-b border-theme p-5',
          isCash ? 'bg-gradient-to-r from-emerald-500/20 to-transparent' : 'bg-gradient-to-r from-sky-500/20 to-transparent',
        ].join(' ')}>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-subtle">Xác nhận trước khi trả xe</p>
          <h3 id="checkout-confirm-title" className="mt-2 text-xl font-bold text-fg">
            {isCash ? 'Đã nhận đủ tiền mặt?' : requiresPayment ? 'Tạo thanh toán chuyển khoản?' : 'Xác nhận cho xe ra?'}
          </h3>
          <p className="mt-1 text-sm text-muted">Kiểm tra kỹ biển số và thanh toán trước khi mở cổng.</p>
        </div>

        <div className="grid gap-4 p-5">
          <div className="rounded-xl border border-theme bg-badge p-4">
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-subtle">Biển số xe</p>
            <p className="mt-1 text-2xl font-black tracking-[0.1em] text-fg">{session.licensePlate}</p>
          </div>

          <div className={[
            'rounded-xl border p-4',
            isCash && requiresPayment
              ? 'border-emerald-500/40 bg-emerald-500/10'
              : 'border-theme bg-badge',
          ].join(' ')}>
            <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-subtle">
              {requiresPayment ? 'Số tiền cần thu' : 'Thanh toán'}
            </p>
            <p className="mt-1 text-2xl font-black text-fg">
              {requiresPayment ? formatStaffCurrency(amount) : 'Không cần thu thêm'}
            </p>
            <p className="mt-1 text-xs text-muted">
              {isCash
                ? 'Chỉ xác nhận sau khi đã nhận và kiểm đếm đủ tiền.'
                : requiresPayment
                  ? 'Hệ thống sẽ tạo mã QR để khách thanh toán.'
                  : 'Xe đã hoàn tất nghĩa vụ thanh toán.'}
            </p>
          </div>
        </div>

        <div className="grid gap-3 border-t border-theme p-5 sm:grid-cols-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="h-12 rounded-xl border border-theme bg-badge px-4 text-sm font-semibold text-fg hover:bg-ghost disabled:opacity-60"
          >
            Quay lại kiểm tra
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isSubmitting}
            className={[
              'h-12 rounded-xl px-4 text-sm font-bold text-white shadow-lg disabled:opacity-60',
              isCash ? 'bg-emerald-600 shadow-emerald-600/20 hover:bg-emerald-500' : 'bg-sky-600 shadow-sky-600/20 hover:bg-sky-500',
            ].join(' ')}
          >
            {isSubmitting ? 'Đang xử lý...' : isCash ? 'Đã nhận tiền, cho xe ra' : requiresPayment ? 'Tạo mã thanh toán' : 'Xác nhận cho xe ra'}
          </button>
        </div>
      </div>
    </div>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-page p-4">
      <dt className="text-[11px] font-medium uppercase tracking-[0.1em] text-subtle">{label}</dt>
      <dd className="mt-1.5 font-semibold text-fg">{value}</dd>
    </div>
  )
}
