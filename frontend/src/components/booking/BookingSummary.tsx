import { formatBookingCurrency, formatBookingDateTime, normalizeBookingPlate } from './bookingUtils'

type BookingSummaryProps = {
  email: string
  phoneNumber: string
  licensePlate: string
  expectedArrivalTime: string
  expectedExitTime: string
  durationHours: number
  estimatedFee: number
}

export function BookingSummary({
  email,
  phoneNumber,
  licensePlate,
  expectedArrivalTime,
  expectedExitTime,
  durationHours,
  estimatedFee,
}: BookingSummaryProps) {
  return (
    <aside className="relative overflow-hidden rounded-[1.75rem] border border-violet-100 bg-white/85 p-6 shadow-[0_20px_50px_-35px_rgba(79,70,229,0.45)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 xl:sticky xl:top-24 xl:self-start">
      <div className="absolute -right-12 -top-12 h-40 w-40 rounded-full bg-violet-200/30 blur-2xl dark:bg-violet-500/10" />
      <div className="relative">
      <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-violet-500">Tóm tắt đặt chỗ</p>
      <h2 className="mt-3 break-all text-2xl font-bold tracking-wide text-fg">
        {normalizeBookingPlate(licensePlate) || 'Chưa nhập biển số'}
      </h2>
      <p className="mt-1 text-sm text-muted">Đặt chỗ ô tô vãng lai</p>

      <dl className="mt-6 space-y-4 text-sm">
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Email</dt>
          <dd className="break-all text-right font-medium text-fg">{email.trim() || '-'}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Số điện thoại</dt>
          <dd className="font-medium text-fg">{phoneNumber.trim() || '-'}</dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Giờ đến</dt>
          <dd className="text-right font-medium text-fg">
            {expectedArrivalTime ? formatBookingDateTime(new Date(expectedArrivalTime).toISOString()) : '-'}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Giờ ra dự kiến</dt>
          <dd className="text-right font-medium text-fg">
            {expectedExitTime ? formatBookingDateTime(new Date(expectedExitTime).toISOString()) : '-'}
          </dd>
        </div>
        <div className="flex items-center justify-between gap-4">
          <dt className="text-subtle">Thời lượng</dt>
          <dd className="font-medium text-fg">{durationHours} giờ</dd>
        </div>
        <div className="border-t border-theme pt-4">
          <div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10">
            <div className="flex items-center justify-between gap-4">
            <dt className="text-muted">Tạm tính</dt>
            <dd className="text-xl font-bold text-violet-700 dark:text-violet-300">{formatBookingCurrency(estimatedFee)}</dd>
            </div>
            <p className="mt-2 text-xs text-subtle">Thanh toán an toàn qua PayOS</p>
          </div>
        </div>
      </dl>
      </div>
    </aside>
  )
}
