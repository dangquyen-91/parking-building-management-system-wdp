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
            {vehicleType === 'motorcycle' ? 'Xe máy theo khung giờ' : 'Ô tô theo block 4 giờ'}
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
          <div className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            Làm tròn lên mỗi {pricing?.blockHours ?? 4} giờ x {formatStaffCurrency(pricing?.blockFee ?? 35000)}.
            {breakdown?.blocks ? ` Phiên này tính ${breakdown.blocks} block.` : ''}
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
