import type { GateCheckoutPreview, GateSession } from '../../../services/staffGateApi'
import { Badge } from '../../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
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
    <Card size="sm">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardDescription>Cách tính phí</CardDescription>
          <CardTitle>
            {vehicleType === 'motorcycle' ? 'Xe máy theo khung giờ' : 'Ô tô theo giờ (phụ thu đêm)'}
          </CardTitle>
        </div>
        {duration && <Badge variant="secondary">Thời gian gửi: {duration}</Badge>}
      </CardHeader>

      <CardContent>
        {vehicleType === 'motorcycle' ? (
          <div className="grid gap-2 sm:grid-cols-3">
            {(pricing?.timeBlocks?.length
              ? pricing.timeBlocks
              : [
                  { startHour: 6, endHour: 17, fee: 5000 },
                  { startHour: 17, endHour: 22, fee: 10000 },
                  { startHour: 22, endHour: 6, fee: 15000 },
                ]
            ).map((block) => (
              <div key={`${block.startHour}-${block.endHour}`} className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">
                  {formatHour(block.startHour)}-{formatHour(block.endHour)}
                </p>
                <p className="mt-1 text-sm font-semibold">{formatStaffCurrency(block.fee)}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="text-xs text-muted-foreground">☀️ Ban ngày (05:00–22:00)</p>
                <p className="mt-1 text-sm font-semibold">{formatStaffCurrency(pricing?.hourlyRate ?? 20000)}/giờ</p>
              </div>
              <div className="rounded-lg border border-amber-300/40 bg-amber-500/10 p-3">
                <p className="text-xs text-amber-700 dark:text-amber-300">🌙 Ban đêm (22:00–05:00)</p>
                <p className="mt-1 text-sm font-semibold text-amber-700 dark:text-amber-300">{formatStaffCurrency(pricing?.nightHourlyRate ?? 30000)}/giờ</p>
              </div>
            </div>
            {breakdown && (breakdown.dayHours != null || breakdown.nightHours != null) && (
              <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
                Phiên này: {breakdown.dayHours ?? 0}h ngày
                {(breakdown.nightHours ?? 0) > 0 ? ` + ${breakdown.nightHours}h đêm` : ''} (làm tròn lên theo giờ)
                {breakdown.capped ? `, đã áp trần ${formatStaffCurrency(breakdown.dailyCap ?? 240000)}/ngày` : ''}.
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
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
