import { Moon, ShieldCheck, Sun } from 'lucide-react'
import {
  CAR_DAILY_CAP,
  CAR_HOURLY_DAY,
  CAR_HOURLY_NIGHT,
  computeBookingBreakdown,
  formatBookingCurrency,
  formatBookingDateTime,
  normalizeBookingPlate,
} from '../bookingUtils'

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
  const arrivalDate = expectedArrivalTime ? new Date(expectedArrivalTime) : null
  const breakdown =
    arrivalDate && !Number.isNaN(arrivalDate.getTime())
      ? computeBookingBreakdown(arrivalDate, durationHours)
      : null

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
          <div className="overflow-hidden rounded-2xl border border-violet-100 dark:border-white/10">
            {breakdown && (breakdown.dayHours > 0 || breakdown.nightHours > 0) && (
              <div className="divide-y divide-violet-100/70 dark:divide-white/5">
                {breakdown.dayHours > 0 && (
                  <div className="flex items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium text-fg">
                        <Sun className="size-4 shrink-0 text-amber-500" /> Ban ngày
                      </p>
                      <p className="mt-0.5 text-xs text-subtle">
                        {breakdown.dayHours} giờ × {CAR_HOURLY_DAY.toLocaleString('vi-VN')}đ/giờ
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-fg">{formatBookingCurrency(breakdown.dayFee)}</span>
                  </div>
                )}
                {breakdown.nightHours > 0 && (
                  <div className="flex items-start justify-between gap-3 bg-amber-50/70 px-4 py-3 dark:bg-amber-500/10">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-300">
                        <Moon className="size-4 shrink-0" /> Ban đêm
                        <span className="rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">Phụ thu 22h–5h</span>
                      </p>
                      <p className="mt-0.5 text-xs text-amber-700/80 dark:text-amber-300/80">
                        {breakdown.nightHours} giờ × {CAR_HOURLY_NIGHT.toLocaleString('vi-VN')}đ/giờ
                      </p>
                    </div>
                    <span className="shrink-0 text-sm font-semibold text-amber-700 dark:text-amber-300">{formatBookingCurrency(breakdown.nightFee)}</span>
                  </div>
                )}
                {breakdown.capped && (
                  <p className="bg-amber-50/70 px-4 py-2 text-xs text-amber-700 dark:bg-amber-500/10 dark:text-amber-300">
                    Đã áp trần {formatBookingCurrency(CAR_DAILY_CAP)}/ngày
                  </p>
                )}
              </div>
            )}
            <div className="flex items-center justify-between gap-4 bg-violet-50 px-4 py-3.5 dark:bg-violet-500/10">
              <dt className="text-sm font-medium text-muted">Tạm tính</dt>
              <dd className="text-2xl font-extrabold text-violet-700 dark:text-violet-300">{formatBookingCurrency(estimatedFee)}</dd>
            </div>
          </div>
          <p className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-subtle">
            <span className="inline-flex items-center gap-1"><Sun className="size-3 text-amber-500" />{formatBookingCurrency(CAR_HOURLY_DAY)}/giờ</span>
            <span className="inline-flex items-center gap-1"><Moon className="size-3" />22h–5h {formatBookingCurrency(CAR_HOURLY_NIGHT)}/giờ</span>
            <span className="inline-flex items-center gap-1"><ShieldCheck className="size-3 text-emerald-500" />PayOS</span>
          </p>
        </div>
      </dl>
      </div>
    </aside>
  )
}
