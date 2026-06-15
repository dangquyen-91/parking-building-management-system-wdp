import { formatBookingCurrency } from './bookingUtils'

type BookingHeroProps = {
  durationHours: number
  estimatedFee: number
}

export function BookingHero({ durationHours, estimatedFee }: BookingHeroProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
      <div>
        <p className="mb-3 text-[10px] uppercase tracking-[0.2em] text-subtle">Người dùng // Đặt chỗ</p>
        <h1 className="text-3xl font-bold tracking-tight text-fg md:text-4xl">Đặt chỗ ô tô vãng lai</h1>
        <p className="mt-3 max-w-2xl text-sm text-muted">
          Tạo đơn đặt chỗ ô tô trả trước bằng số điện thoại, biển số, thời gian đến và thời lượng. Hệ thống kiểm tra sức
          chứa theo khung giờ và không yêu cầu chọn slot cụ thể.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 text-center sm:min-w-96">
        <div className="rounded-lg border border-theme bg-badge px-3 py-2">
          <p className="text-lg font-semibold text-fg">Ô tô</p>
          <p className="text-[11px] text-subtle">Loại xe</p>
        </div>
        <div className="rounded-lg border border-theme bg-badge px-3 py-2">
          <p className="text-lg font-semibold text-fg">{durationHours}h</p>
          <p className="text-[11px] text-subtle">Thời lượng</p>
        </div>
        <div className="rounded-lg border border-theme bg-badge px-3 py-2">
          <p className="text-lg font-semibold text-fg">{formatBookingCurrency(estimatedFee)}</p>
          <p className="text-[11px] text-subtle">Tạm tính</p>
        </div>
      </div>
    </div>
  )
}
