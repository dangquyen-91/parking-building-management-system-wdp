import type {
  AvailableMotorcycleSubscriptions,
  AvailableSubscriptionFloor,
  Plan,
  Subscription,
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
  createdSubscription: Subscription | null
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
  createdSubscription,
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
    <section className="liquid-glass-card overflow-hidden rounded-2xl">
      <div className="flex items-center gap-3 border-b border-theme bg-gradient-to-r from-emerald-500/15 via-transparent to-transparent p-5 md:p-6">
        <span className="flex size-11 items-center justify-center rounded-xl bg-emerald-500 text-sm font-black text-white shadow-lg shadow-emerald-500/20">
          4
        </span>
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Thanh toán</p>
          <h2 className="mt-1 text-xl font-bold text-fg">Kiểm tra và hoàn tất thanh toán</h2>
          <p className="mt-2 text-sm text-muted">
            Kiểm tra lại thông tin, sau đó tạo mã thanh toán để kích hoạt gói cư dân.
          </p>
        </div>
      </div>

      <div className={`grid gap-4 p-5 md:p-6 ${payment ? 'lg:grid-cols-[minmax(0,1fr)_26rem]' : ''}`}>
        <div className="overflow-hidden rounded-xl border border-theme bg-badge text-sm">
          <div className="border-b border-theme bg-page p-4">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">Tóm tắt</p>
          </div>
          <dl className="grid gap-px bg-[color:var(--border)]">
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
              className="m-4 h-14 w-[calc(100%-2rem)] rounded-xl bg-btn-primary px-4 text-sm font-bold text-btn-primary-fg shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              disabled={!canSubmit || isSubmitting}
              onClick={onCreatePayment}
            >
              {isSubmitting ? 'Đang tạo đơn...' : 'Tạo đơn và thanh toán'}
            </button>
          )}
        </div>

        {payment && createdSubscription && <SubscriptionPaymentCard payment={payment} subscription={createdSubscription} />}
      </div>

      <div className="border-t border-theme p-4 md:p-5">
        <SubscriptionWizardActions previousLabel="Quay lại chọn vị trí" onPrevious={onPrevious} />
      </div>
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
    <div className={`flex gap-4 bg-page p-4 ${multiline ? 'items-start' : 'items-center'} justify-between`}>
      <dt className="text-subtle">{label}</dt>
      <dd className={`${multiline ? 'max-w-sm' : ''} text-right font-semibold text-fg`}>{value}</dd>
    </div>
  )
}
