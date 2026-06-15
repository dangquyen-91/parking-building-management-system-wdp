import type { VehicleType } from '../../services/userSubscriptionApi'

export type SubscriptionStep = 1 | 2 | 3 | 4

const SUBSCRIPTION_STEPS = [
  { value: 1, title: 'Thông tin xe', description: 'Loại xe và biển số' },
  { value: 2, title: 'Chọn gói', description: 'Gói phù hợp với xe' },
  { value: 3, title: 'Chọn slot', description: 'Vị trí gửi xe cư dân' },
  { value: 4, title: 'Thanh toán', description: 'Thanh toán PayOS' },
] as const

type SubscriptionStepHeaderProps = {
  step: SubscriptionStep
  canGoStep2: boolean
  canGoStep3: boolean
  canGoStep4: boolean
  onStepChange: (step: SubscriptionStep) => void
}

export function SubscriptionStepHeader({
  step,
  canGoStep2,
  canGoStep3,
  canGoStep4,
  onStepChange,
}: SubscriptionStepHeaderProps) {
  return (
    <div className="mb-6 rounded-lg border border-theme bg-badge p-5 md:p-7">
      <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-subtle">User // Gói cư dân</p>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Mua gói cư dân</h1>
          <p className="mt-3 max-w-2xl text-sm text-muted">
            Nhập thông tin xe, chọn gói phù hợp, vị trí gửi xe và thanh toán để kích hoạt quyền cư dân.
          </p>
        </div>

        <div className="grid gap-2 sm:min-w-[38rem] sm:grid-cols-4">
          {SUBSCRIPTION_STEPS.map((item) => {
            const active = step === item.value
            const done = step > item.value

            return (
              <button
                key={item.value}
                type="button"
                className={[
                  'rounded-lg border px-3 py-2 text-left transition',
                  active
                    ? 'border-transparent bg-btn-primary text-btn-primary-fg'
                    : done
                      ? 'border-emerald-400/50 bg-emerald-500/10 text-fg'
                      : 'border-theme bg-page/70 text-muted',
                ].join(' ')}
                onClick={() => {
                  if (item.value === 1) onStepChange(1)
                  if (item.value === 2 && canGoStep2) onStepChange(2)
                  if (item.value === 3 && canGoStep2 && canGoStep3) onStepChange(3)
                  if (item.value === 4 && canGoStep2 && canGoStep3 && canGoStep4) onStepChange(4)
                }}
              >
                <span className="block text-base font-bold">{item.value}</span>
                <span className="block text-[11px] font-semibold">{item.title}</span>
                <span className="mt-0.5 block text-[10px] opacity-75">{item.description}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export type SubscriptionVehicleType = VehicleType
