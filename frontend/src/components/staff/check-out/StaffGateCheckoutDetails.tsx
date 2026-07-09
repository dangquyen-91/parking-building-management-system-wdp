import type { ReactNode } from 'react'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { GateCheckoutPreview, GateSession } from '../../../services/staffGateApi'
import { formatGateTime, formatStaffCurrency } from '../data/staffGateUi'
import { formatCustomerType, formatSessionSpot, formatVehicleType } from '../data/staffGateUtils'
import { StaffGateCheckoutPricing } from './StaffGateCheckoutPricing'

type StaffGateCheckoutDetailsProps = {
  session?: GateSession
  preview: GateCheckoutPreview | null
  amountToCollect: number
  isPreviewLoading: boolean
  floorMap: Map<string, Floor>
  actions: ReactNode
}

export function StaffGateCheckoutDetails({
  session,
  preview,
  amountToCollect,
  isPreviewLoading,
  floorMap,
  actions,
}: StaffGateCheckoutDetailsProps) {
  if (!session) {
    return (
      <div className="flex min-h-44 flex-col items-center justify-center rounded-xl border border-dashed border-theme bg-badge p-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-ghost text-xl text-muted">⌕</span>
        <p className="mt-3 text-sm font-semibold text-fg">Chưa tìm thấy xe đang gửi</p>
        <p className="mt-1 max-w-sm text-xs text-muted">Nhập biển số hoặc mã phiên để xem thông tin và thực hiện thanh toán.</p>
      </div>
    )
  }

  const hasPrepaidBooking = Boolean(preview?.bookingId)

  return (
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
          label="Thu thêm tiền"
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
        <p className="m-4 rounded-lg border border-theme bg-page p-3 text-xs text-muted">{formatCheckoutNote(preview.note)}</p>
      )}

      {preview && <StaffGateCheckoutPricing preview={preview} vehicleType={session.vehicleType} />}

      {actions}
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

function formatCheckoutNote(note: string) {
  const normalizedNote = note.trim().toLowerCase()

  if (normalizedNote === 'resident with active subscription — no fee') {
    return 'Cư dân có gói đang hiệu lực - không thu phí.'
  }

  if (normalizedNote === 'resident with active subscription - no fee') {
    return 'Cư dân có gói đang hiệu lực - không thu phí.'
  }

  if (normalizedNote === 'walk-in pay-at-exit') {
    return 'Khách vãng lai - thanh toán khi xe ra.'
  }

  if (normalizedNote === 'booking prepaid covers full stay. free check-out.') {
    return 'Booking đã trả trước đủ thời gian gửi xe. Không cần thu thêm.'
  }

  const bookingOvertimeMatch = note.match(
    /^Booking prepaid (\d+)đ, full stay (\d+)đ\. Collect overtime (\d+)đ\.$/,
  )

  if (bookingOvertimeMatch) {
    const [, prepaidAmount, fullStayFee, overtimeFee] = bookingOvertimeMatch
    return `Booking đã trả trước ${prepaidAmount}đ, phí toàn bộ lượt gửi là ${fullStayFee}đ. Cần thu thêm phí quá giờ ${overtimeFee}đ.`
  }

  return note
}
