import type { ManagerBooking } from '../../../services/managerBookingsApi'
import { ManagerBookingCard } from './ManagerBookingCard'

type ManagerBookingListProps = {
  bookings: ManagerBooking[]
  isLoading: boolean
}

export function ManagerBookingList({ bookings, isLoading }: ManagerBookingListProps) {
  if (isLoading) {
    return <div className="liquid-glass-card rounded-lg p-4 text-sm text-muted">Đang tải danh sách booking...</div>
  }

  if (bookings.length === 0) {
    return <div className="liquid-glass-card rounded-lg p-4 text-sm text-muted">Không có booking phù hợp.</div>
  }

  return (
    <section className="liquid-glass-card rounded-lg p-4 md:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Danh sách đặt chỗ</p>
          <h2 className="mt-1 text-base font-semibold text-fg">Booking gần đây</h2>
        </div>
        <span className="rounded-full border border-theme px-3 py-1 text-xs font-semibold text-subtle">
          {bookings.length} booking
        </span>
      </div>
      <div className="grid gap-3">
        {bookings.map((booking) => <ManagerBookingCard key={booking._id} booking={booking} />)}
      </div>
    </section>
  )
}
