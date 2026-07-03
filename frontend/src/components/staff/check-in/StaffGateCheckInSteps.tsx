export type CheckInStep = 1 | 2 | 3 | 4

const CHECK_IN_STEPS: Array<{ value: CheckInStep; title: string; description: string }> = [
  { value: 1, title: 'Biển số', description: 'Camera hoặc nhập tay' },
  { value: 2, title: 'Thông tin', description: 'Loại khách và hồ sơ' },
  { value: 3, title: 'QR', description: 'Xác minh đúng xe' },
  { value: 4, title: 'Vị trí', description: 'Loại xe, tầng, ghi chú' },
]

export function CheckInStepHeader({
  step,
  canOpenStep,
  onStepChange,
}: {
  step: CheckInStep
  canOpenStep: (step: CheckInStep) => boolean
  onStepChange: (step: CheckInStep) => void
}) {
  return (
    <div className="grid gap-px border-b border-theme bg-[color:var(--border)] sm:grid-cols-4">
      {CHECK_IN_STEPS.map((item) => {
        const active = step === item.value
        const done = step > item.value
        const canOpen = canOpenStep(item.value)

        return (
          <button
            key={item.value}
            type="button"
            disabled={!canOpen}
            onClick={() => onStepChange(item.value)}
            className={[
              'flex min-h-20 items-center gap-3 bg-page px-4 py-3 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-55',
              active
                ? 'bg-btn-primary text-btn-primary-fg'
                : done
                  ? 'bg-emerald-500/10 text-fg'
                  : 'text-muted hover:bg-ghost',
            ].join(' ')}
          >
            <span className={[
              'flex size-8 shrink-0 items-center justify-center rounded-full border text-xs font-black',
              active ? 'border-white/30 bg-white/15' : done ? 'border-emerald-500/30 bg-emerald-500 text-white' : 'border-theme bg-badge',
            ].join(' ')}>
              {done ? '✓' : item.value}
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-bold">{item.title}</span>
              <span className="mt-0.5 block text-[10px] opacity-70">{item.description}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function StepIntro({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
      <p className="text-base font-black text-fg">{title}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </div>
  )
}

export function CheckInWizardActions({
  step,
  canNext,
  canCheckIn,
  isSubmitting,
  onPrevious,
  onNext,
  onCheckIn,
}: {
  step: CheckInStep
  canNext: boolean
  canCheckIn: boolean
  isSubmitting: boolean
  onPrevious?: () => void
  onNext?: () => void
  onCheckIn: () => void
}) {
  return (
    <div className="flex flex-col-reverse gap-3 rounded-2xl border border-theme bg-badge p-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {onPrevious && (
          <button
            type="button"
            className="h-12 rounded-xl border border-theme px-5 text-sm font-semibold text-fg transition-colors hover:bg-ghost"
            onClick={onPrevious}
          >
            Quay lại
          </button>
        )}
      </div>

      {step < 4 ? (
        <button
          type="button"
          className="h-12 rounded-xl bg-btn-primary px-6 text-sm font-bold text-btn-primary-fg shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          disabled={!canNext}
          onClick={onNext}
        >
          Tiếp tục →
        </button>
      ) : (
        <button
          type="button"
          onClick={onCheckIn}
          disabled={!canCheckIn || isSubmitting}
          className="h-12 rounded-xl bg-emerald-600 px-6 text-sm font-bold text-white shadow-lg shadow-emerald-600/20 transition-all hover:-translate-y-0.5 hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
        >
          {isSubmitting ? 'Đang ghi nhận...' : 'Xác nhận cho xe vào →'}
        </button>
      )}
    </div>
  )
}
