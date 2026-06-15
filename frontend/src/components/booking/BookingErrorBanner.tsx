type BookingErrorBannerProps = {
  error: string
}

export function BookingErrorBanner({ error }: BookingErrorBannerProps) {
  return (
    <div className="mb-5 rounded-lg border border-rose-500/50 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-100">
      {error}
    </div>
  )
}
