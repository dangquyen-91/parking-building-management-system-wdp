import type { FormEvent, ReactNode } from 'react'
import { MAX_DURATION_HOURS } from '../bookingUtils'
import { BookingPolicyNotice } from './BookingPolicyNotice'

type BookingFormProps = {
  email: string
  phoneNumber: string
  licensePlate: string
  expectedArrivalTime: string
  durationHours: number
  canSubmit: boolean
  isSubmitting: boolean
  isEmailLocked?: boolean
  onEmailChange: (value: string) => void
  onPhoneNumberChange: (value: string) => void
  onLicensePlateChange: (value: string) => void
  onExpectedArrivalTimeChange: (value: string) => void
  onDurationHoursChange: (updater: (value: number) => number) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
}

function FieldLabel({ children }: { children: ReactNode }) {
  return <label className="text-[11px] font-bold uppercase tracking-[0.14em] text-violet-700 dark:text-violet-300">{children}</label>
}

export function BookingForm({
  email,
  phoneNumber,
  licensePlate,
  expectedArrivalTime,
  durationHours,
  canSubmit,
  isSubmitting,
  isEmailLocked = false,
  onEmailChange,
  onPhoneNumberChange,
  onLicensePlateChange,
  onExpectedArrivalTimeChange,
  onDurationHoursChange,
  onSubmit,
}: BookingFormProps) {
  return (
    <form
      className="overflow-hidden rounded-[1.75rem] border border-white/70 bg-white/80 p-5 shadow-[0_24px_60px_-32px_rgba(30,64,175,0.55)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/65 md:p-7"
      onSubmit={onSubmit}
    >
      <div className="mb-6 flex items-center gap-4">
        <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-600 to-sky-500 text-xl font-black text-white shadow-lg shadow-violet-500/25">
          P
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-600 dark:text-sky-300">Thông tin đặt chỗ</p>
          <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">Bạn muốn gửi xe khi nào?</h2>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <FieldLabel>Email</FieldLabel>
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            required
            readOnly={isEmailLocked}
            className="auth-input h-12 rounded-xl border px-4 text-sm text-fg shadow-sm read-only:opacity-80"
            placeholder="guest@example.com"
          />
          <p className="text-xs text-subtle">
            Email này sẽ nhận thông tin booking sau khi chuyển khoản thành công.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel>Số điện thoại</FieldLabel>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(event) => onPhoneNumberChange(event.target.value)}
            minLength={8}
            maxLength={15}
            className="auth-input h-12 rounded-xl border px-4 text-sm text-fg shadow-sm"
            placeholder="0912345678"
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel>Biển số xe</FieldLabel>
          <input
            type="text"
            value={licensePlate}
            onChange={(event) => onLicensePlateChange(event.target.value.toUpperCase())}
            minLength={4}
            maxLength={20}
            required
            className="auth-input h-12 rounded-xl border px-4 text-sm font-bold uppercase tracking-wide text-fg shadow-sm"
            placeholder="51F-12345"
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel>Thời gian đến dự kiến</FieldLabel>
          <input
            type="datetime-local"
            value={expectedArrivalTime}
            onChange={(event) => onExpectedArrivalTimeChange(event.target.value)}
            required
            className="auth-input h-12 rounded-xl border px-4 text-sm text-fg shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel>Thời lượng</FieldLabel>
          <div className="flex h-12 items-center rounded-xl border border-violet-200 bg-violet-50 px-2 shadow-sm dark:border-violet-700/50 dark:bg-violet-500/10">
            <button
              type="button"
              className="h-8 w-8 rounded-lg bg-white font-bold text-violet-700 shadow-sm hover:bg-violet-100 dark:bg-white/10 dark:text-violet-200"
              onClick={() => onDurationHoursChange((value) => Math.max(1, value - 1))}
              aria-label="Giảm thời lượng"
            >
              -
            </button>
            <span className="flex-1 text-center text-sm font-semibold text-fg">{durationHours} giờ</span>
            <button
              type="button"
              className="h-8 w-8 rounded-lg bg-violet-600 font-bold text-white shadow-sm hover:bg-violet-700"
              onClick={() => onDurationHoursChange((value) => Math.min(MAX_DURATION_HOURS, value + 1))}
              aria-label="Tăng thời lượng"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <BookingPolicyNotice />

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="mt-6 h-12 w-full rounded-xl bg-gradient-to-r from-violet-600 via-purple-600 to-sky-500 px-4 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition hover:-translate-y-0.5 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Đang tạo đặt chỗ...' : 'Tạo đặt chỗ và thanh toán'}
      </button>
    </form>
  )
}
