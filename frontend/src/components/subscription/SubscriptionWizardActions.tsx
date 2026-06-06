type SubscriptionWizardActionsProps = {
  previousLabel?: string
  nextLabel?: string
  canNext?: boolean
  onPrevious?: () => void
  onNext?: () => void
}

export function SubscriptionWizardActions({
  previousLabel,
  nextLabel,
  canNext = true,
  onPrevious,
  onNext,
}: SubscriptionWizardActionsProps) {
  return (
    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        {onPrevious && (
          <button
            type="button"
            className="h-11 rounded-lg border border-theme px-5 text-sm font-semibold text-fg transition-colors hover:bg-ghost"
            onClick={onPrevious}
          >
            {previousLabel ?? 'Quay lại'}
          </button>
        )}
      </div>

      {onNext && (
        <button
          type="button"
          className="h-11 rounded-lg bg-btn-primary px-5 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
          disabled={!canNext}
          onClick={onNext}
        >
          {nextLabel ?? 'Tiếp tục'}
        </button>
      )}
    </div>
  )
}
