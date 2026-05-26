type AuthSubmitStatus = 'idle' | 'loading' | 'success'

type AuthSubmitButtonProps = {
  status: AuthSubmitStatus
  labels: {
    idle: string
    loading: string
    success: string
  }
}

const SUBMIT_CLASS =
  'w-full rounded-full py-3.5 text-sm font-medium transition-[transform,background-color,opacity] duration-200 bg-btn-primary text-btn-primary-fg hover:opacity-90 active:scale-[0.98] disabled:opacity-60 disabled:pointer-events-none'

export function AuthSubmitButton({ status, labels }: AuthSubmitButtonProps) {
  const label =
    status === 'loading' ? labels.loading : status === 'success' ? labels.success : labels.idle

  return (
    <button
      type="submit"
      disabled={status === 'loading' || status === 'success'}
      className={[SUBMIT_CLASS, status === 'loading' ? 'animate-pulse' : ''].join(' ')}
    >
      {label}
    </button>
  )
}
