import type { VehicleType } from '../../../services/userSubscriptionApi'

export type SubscriptionStep = 1 | 2 | 3 | 4

const SUBSCRIPTION_STEPS = [
  { value: 1, title: 'Thông tin xe', description: 'Biển số xe' },
  { value: 2, title: 'Chọn gói', description: 'Gói phù hợp với xe' },
  { value: 3, title: 'Vị trí đỗ', description: 'Khu vực gửi xe' },
  { value: 4, title: 'Thanh toán', description: 'Kiểm tra và thanh toán' },
] as const

type SubscriptionStepHeaderProps = {
  step: SubscriptionStep
  canGoStep2: boolean
  canGoStep3: boolean
  canGoStep4: boolean
  onStepChange: (step: SubscriptionStep) => void
  hidePlanStep?: boolean
  hideSlotStep?: boolean
}

export function SubscriptionStepHeader({
  step,
  canGoStep2,
  canGoStep3,
  canGoStep4,
  onStepChange,
  hidePlanStep = false,
  hideSlotStep = false,
}: SubscriptionStepHeaderProps) {
  const visibleSteps = SUBSCRIPTION_STEPS.filter((item) => {
    if (hidePlanStep && item.value === 2) return false
    if (hideSlotStep && item.value === 3) return false
    return true
  })
  const gridColumns = visibleSteps.length === 2
    ? 'sm:grid-cols-2'
    : visibleSteps.length === 3
      ? 'sm:grid-cols-3'
      : 'sm:grid-cols-4'

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-theme bg-badge">
      <div className="bg-gradient-to-r from-sky-500/15 via-transparent to-emerald-500/10 p-5 md:p-7">
        <div className="mb-3 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-subtle">
          <span className="size-2 rounded-full bg-emerald-500 shadow-[0_0_12px_rgba(34,197,94,0.8)]" />
          Đăng ký trực tuyến
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight text-fg md:text-4xl">Mua gói gửi xe cư dân</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">
            Hoàn tất các bước để đăng ký quyền gửi xe cư dân cho biển số của bạn.
          </p>
        </div>
      </div>

      <div className={`grid gap-px border-t border-theme bg-[color:var(--border)] ${gridColumns}`}>
        {visibleSteps.map((item, index) => {
          const active = step === item.value
          const done = step > item.value

          return (
            <button
              key={item.value}
              type="button"
              className={[
                'flex min-h-20 items-center gap-3 bg-page px-4 py-3 text-left transition-colors',
                active
                  ? 'bg-btn-primary text-btn-primary-fg'
                  : done
                    ? 'bg-emerald-500/10 text-fg'
                    : 'text-muted hover:bg-ghost',
              ].join(' ')}
              onClick={() => {
                if (item.value === 1) onStepChange(1)
                if (item.value === 2 && canGoStep2) onStepChange(2)
                if (item.value === 3 && canGoStep2 && canGoStep3) onStepChange(3)
                if (item.value === 4 && canGoStep2 && canGoStep3 && canGoStep4) onStepChange(4)
              }}
            >
              <span
                className={[
                  'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-black',
                  active
                    ? 'border-white/30 bg-white/15'
                    : done
                      ? 'border-emerald-500/30 bg-emerald-500 text-white'
                      : 'border-theme bg-badge',
                ].join(' ')}
              >
                {done ? '✓' : index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-bold">{item.title}</span>
                <span className="mt-0.5 block text-[10px] opacity-70">{item.description}</span>
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export type SubscriptionVehicleType = VehicleType
