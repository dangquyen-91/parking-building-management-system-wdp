import type {
  AvailableMotorcycleSubscriptions,
  AvailableSubscriptionFloor,
  Plan,
  SubscriptionPayment,
  VehicleType,
} from '../../services/userSubscriptionApi'
import { normalizePlate } from '../../utils/subscriptionUi'
import { SubscriptionPaymentCard } from './SubscriptionPaymentCard'
import { SubscriptionWizardActions } from './SubscriptionWizardActions'

type ResidentSubscriptionPaymentStepProps = {
  vehicleType: VehicleType
  selectedPlan?: Plan
  licensePlate: string
  selectedSlotId: string
  carFloors: AvailableSubscriptionFloor[]
  motorcycleAvailability: AvailableMotorcycleSubscriptions | null
  payment: SubscriptionPayment | null
  canSubmit: boolean
  isSubmitting: boolean
  onCreatePayment: () => void
  onPrevious: () => void
}

export function ResidentSubscriptionPaymentStep({
  vehicleType,
  selectedPlan,
  licensePlate,
  selectedSlotId,
  carFloors,
  motorcycleAvailability,
  payment,
  canSubmit,
  isSubmitting,
  onCreatePayment,
  onPrevious,
}: ResidentSubscriptionPaymentStepProps) {
  const selectedParkingSpot = carFloors
    .flatMap((floor) => floor.slots.map((slot) => ({ floor, slot })))
    .find((item) => item.slot._id === selectedSlotId)
  const motorcycleFloor = motorcycleAvailability?.floors[0]

  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-6">
      <div className="flex items-center gap-3 border-b border-theme pb-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-btn-primary text-sm font-bold text-btn-primary-fg">
          3
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Thanh toán</p>
          <h2 className="mt-1 text-xl font-semibold text-fg">Tạo đơn và quét QR PayOS</h2>
          <p className="mt-2 text-sm text-muted">
            Kiểm tra lại thông tin, sau đó tạo mã thanh toán để kích hoạt gói cư dân.
          </p>
        </div>
      </div>

      <div className={`mt-5 grid gap-4 ${payment ? 'lg:grid-cols-[minmax(0,1fr)_26rem]' : ''}`}>
        <div className="rounded-lg border border-theme bg-badge p-4 text-sm">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">Tóm tắt</p>
          <dl className="mt-4 grid gap-3">
            <SummaryRow label="Gói" value={selectedPlan?.name ?? '-'} />
            <SummaryRow label="Biển số" value={normalizePlate(licensePlate)} />
            <SummaryRow label="Loại xe" value={vehicleType === 'car' ? 'Ô tô' : 'Xe máy'} />
            <SummaryRow
              label="Tòa nhà"
              value={
                vehicleType === 'car'
                  ? selectedParkingSpot?.floor.floor.building?.name ?? '-'
                  : motorcycleFloor?.building?.name ?? 'Tầng xe máy cư dân'
              }
            />
            <SummaryRow
              label="Địa chỉ"
              value={
                vehicleType === 'car'
                  ? selectedParkingSpot?.floor.floor.building?.address ?? '-'
                  : motorcycleFloor?.building?.address ?? '-'
              }
              multiline
            />
            <SummaryRow
              label="Tầng"
              value={
                vehicleType === 'car'
                  ? selectedParkingSpot?.floor.floor.floorNumber ?? '-'
                  : motorcycleFloor?.floorNumber ?? '-'
              }
            />
            <SummaryRow
              label="Slot"
              value={vehicleType === 'car' ? selectedParkingSpot?.slot.slotCode ?? '-' : 'Sức chứa chung'}
            />
          </dl>

          {!payment && (
            <button
              type="button"
              className="mt-5 h-11 w-full rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              disabled={!canSubmit || isSubmitting}
              onClick={onCreatePayment}
            >
              {isSubmitting ? 'Đang tạo đơn...' : 'Tạo đơn và thanh toán'}
            </button>
          )}
        </div>

        {payment && <SubscriptionPaymentCard payment={payment} />}
      </div>

      <SubscriptionWizardActions previousLabel="Quay lại chọn slot" onPrevious={onPrevious} />
    </section>
  )
}

type SummaryRowProps = {
  label: string
  value: string | number
  multiline?: boolean
}

function SummaryRow({ label, value, multiline = false }: SummaryRowProps) {
  return (
    <div className={`flex gap-4 ${multiline ? 'items-start' : 'items-center'} justify-between`}>
      <dt className="text-subtle">{label}</dt>
      <dd className={`${multiline ? 'max-w-sm' : ''} text-right font-semibold text-fg`}>{value}</dd>
    </div>
  )
}
