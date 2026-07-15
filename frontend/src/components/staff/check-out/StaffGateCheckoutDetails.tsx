import type { ReactNode } from 'react'
import { Banknote, CarFront, Clock3, MapPin, Search, ShieldCheck, UserRound } from 'lucide-react'
import type { Floor } from '../../../services/managerBuildingsApi'
import type { GateCheckoutPreview, GateSession } from '../../../services/staffGateApi'
import { Badge } from '../../ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
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
      <Card className="border-dashed bg-muted/20 shadow-none">
        <CardHeader className="items-center text-center">
          <span className="flex size-12 items-center justify-center rounded-lg bg-muted text-muted-foreground">
            <Search className="size-5" />
          </span>
          <CardTitle>Chưa tìm thấy xe đang gửi</CardTitle>
          <CardDescription>
            Nhập biển số để xem thông tin và thực hiện thanh toán.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const hasPrepaidBooking = Boolean(preview?.bookingId)

  return (
    <Card className="border-emerald-500/15 shadow-none">
      <CardHeader className="border-b bg-gradient-to-r from-emerald-500/10 to-transparent pb-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardDescription className="font-semibold uppercase tracking-[0.14em]">Biển số xe</CardDescription>
            <CardTitle className="mt-1 text-3xl font-black tracking-[0.1em]">{session.licensePlate}</CardTitle>
          </div>
          <Badge variant="secondary">Đang gửi</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <dl className="grid gap-3 sm:grid-cols-2">
          <Detail icon={<UserRound className="size-4" />} label="Loại khách" value={formatCustomerType(session.customerType)} />
          <Detail icon={<CarFront className="size-4" />} label="Loại xe" value={formatVehicleType(session.vehicleType)} />
          <Detail icon={<MapPin className="size-4" />} label="Vị trí" value={formatSessionSpot(session, floorMap)} />
          <Detail icon={<Clock3 className="size-4" />} label="Giờ vào" value={formatGateTime(session.entryTime)} />
          <Detail
            icon={<Banknote className="size-4" />}
            label="Thu thêm tiền"
            value={isPreviewLoading ? 'Đang tính...' : formatStaffCurrency(amountToCollect)}
            emphasis
          />
          <Detail
            icon={<ShieldCheck className="size-4" />}
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
          <p className="rounded-lg border bg-muted/30 p-3 text-xs text-muted-foreground">
            {formatCheckoutNote(preview.note)}
          </p>
        )}

        {preview && <StaffGateCheckoutPricing preview={preview} vehicleType={session.vehicleType} />}
      </CardContent>
      {actions}
    </Card>
  )
}

function Detail({ label, value, icon, emphasis = false }: { label: string; value: string; icon?: ReactNode; emphasis?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${emphasis ? 'border-emerald-500/25 bg-emerald-500/10' : 'bg-muted/25'}`}>
      <dt className="flex items-center gap-2 text-xs text-muted-foreground">{icon}{label}</dt>
      <dd className={`mt-1.5 ${emphasis ? 'text-lg font-bold text-emerald-700 dark:text-emerald-300' : 'font-semibold'}`}>{value}</dd>
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
