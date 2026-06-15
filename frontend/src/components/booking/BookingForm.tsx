import type { FormEvent, ReactNode } from 'react'
import { MAX_DURATION_HOURS } from './bookingUtils'

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
  return <label className="text-xs font-medium uppercase tracking-[0.14em] text-subtle">{children}</label>
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
    <form className="liquid-glass-card rounded-lg p-4 md:p-5" onSubmit={onSubmit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-2">
          <FieldLabel>Email</FieldLabel>
          <input
            type="email"
            value={email}
            onChange={(event) => onEmailChange(event.target.value)}
            required
            readOnly={isEmailLocked}
            className="auth-input h-11 rounded-lg border px-3 text-sm text-fg read-only:opacity-80"
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
            className="auth-input h-11 rounded-lg border px-3 text-sm text-fg"
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
            className="auth-input h-11 rounded-lg border px-3 text-sm uppercase text-fg"
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
            className="auth-input h-11 rounded-lg border px-3 text-sm text-fg"
          />
        </div>

        <div className="flex flex-col gap-2">
          <FieldLabel>Thời lượng</FieldLabel>
          <div className="flex h-11 items-center rounded-lg border border-theme bg-badge px-2">
            <button
              type="button"
              className="h-8 w-8 rounded-md text-muted hover:bg-ghost hover:text-fg"
              onClick={() => onDurationHoursChange((value) => Math.max(1, value - 1))}
              aria-label="Giảm thời lượng"
            >
              -
            </button>
            <span className="flex-1 text-center text-sm font-semibold text-fg">{durationHours} giờ</span>
            <button
              type="button"
              className="h-8 w-8 rounded-md text-muted hover:bg-ghost hover:text-fg"
              onClick={() => onDurationHoursChange((value) => Math.min(MAX_DURATION_HOURS, value + 1))}
              aria-label="Tăng thời lượng"
            >
              +
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-lg border border-theme bg-badge p-4 text-sm text-muted">
        <p>
          Đơn này dùng sức chứa chung của khu ô tô vãng lai. Slot cụ thể sẽ được xử lý sau ở luồng cổng/phiên gửi xe,
          nên màn hình này không gửi tòa nhà, tầng hoặc mã slot lên hệ thống.
        </p>
      </div>

      <button
        type="submit"
        disabled={!canSubmit || isSubmitting}
        className="mt-6 h-11 w-full rounded-lg bg-btn-primary px-4 text-sm font-semibold text-btn-primary-fg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? 'Đang tạo đặt chỗ...' : 'Tạo đặt chỗ và thanh toán'}
      </button>
    </form>
  )
}
