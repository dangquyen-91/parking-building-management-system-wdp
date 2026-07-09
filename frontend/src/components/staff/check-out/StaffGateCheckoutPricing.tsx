import type { GateCheckoutPreview, GateSession } from '../../../services/staffGateApi'
import { formatStaffCurrency } from '../data/staffGateUi'

type StaffGateCheckoutPricingProps = {
  preview: GateCheckoutPreview
  vehicleType: GateSession['vehicleType']
}

export function StaffGateCheckoutPricing({
  preview,
  vehicleType,
}: StaffGateCheckoutPricingProps) {
  const pricing = preview.pricing
  const breakdown = preview.breakdown
  const duration = formatDuration(breakdown?.durationMs)

  return (
    <div className="border-t border-theme bg-page/40 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">Cách tính phí</p>
          <p className="mt-1 text-sm font-bold text-fg">
            {vehicleType === 'motorcycle' ? 'Xe máy theo khung giờ' : 'Ô tô theo block 4 giờ'}
          </p>
        </div>
        {duration && (
          <span className="rounded-full border border-theme bg-badge px-3 py-1 text-[10px] font-semibold text-muted">
            Thời gian gửi: {duration}
          </span>
        )}
      </div>

      {vehicleType === 'motorcycle' ? (
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {(pricing?.timeBlocks?.length
            ? pricing.timeBlocks
            : [
                { startHour: 6, endHour: 17, fee: 5000 },
                { startHour: 17, endHour: 22, fee: 10000 },
                { startHour: 22, endHour: 6, fee: 15000 },
              ]
          ).map((block) => (
            <div key={`${block.startHour}-${block.endHour}`} className="rounded-lg border border-theme bg-badge p-3">
              <p className="text-[10px] font-semibold text-subtle">
                {formatHour(block.startHour)}-{formatHour(block.endHour)}
              </p>
              <p className="mt-1 text-sm font-bold text-fg">{formatStaffCurrency(block.fee)}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-lg border border-theme bg-badge p-3 text-xs text-muted">
          Làm tròn lên mỗi {pricing?.blockHours ?? 4} giờ x {formatStaffCurrency(pricing?.blockFee ?? 35000)}.
          {breakdown?.blocks ? ` Phiên này tính ${breakdown.blocks} block.` : ''}
        </div>
      )}

    </div>
  )
}

function formatHour(hour: number) {
  return `${String(hour).padStart(2, '0')}:00`
}

function formatDuration(durationMs?: number) {
  if (durationMs === undefined) return undefined
  const minutes = Math.max(1, Math.ceil(durationMs / 60_000))
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  if (hours === 0) return `${remainingMinutes} phút`
  return `${hours} giờ ${remainingMinutes} phút`
}
