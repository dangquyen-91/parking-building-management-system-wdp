import { useEffect, useState } from 'react'
import { AdminPageShell, AdminStatCard, AdminStatusBadge, formatAdminCurrency } from '../components/admin'
import { adminApi, type AdminBooking } from '../services/adminApi'

const vehicleTypeLabels: Record<AdminBooking['vehicleType'], string> = {
  car: 'Ô tô',
}

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadBookings() {
      try {
        setIsLoading(true)
        setError('')
        const response = await adminApi.getBookings({ limit: 100 })
        if (!ignore) {
          setBookings(response.bookings)
          setTotal(response.total)
        }
      } catch (loadError) {
        if (!ignore) setError(loadError instanceof Error ? loadError.message : 'Không thể tải đặt chỗ')
      } finally {
        if (!ignore) setIsLoading(false)
      }
    }

    loadBookings()

    return () => {
      ignore = true
    }
  }, [])

  const paidBookings = bookings.filter((booking) => booking.status === 'paid' || booking.status === 'used').length
  const pendingBookings = bookings.filter((booking) => booking.status === 'pending').length
  const revenue = bookings
    .filter((booking) => booking.status === 'paid' || booking.status === 'used')
    .reduce((sum, booking) => sum + booking.amount, 0)

  return (
    <AdminPageShell
      eyebrow="Admin // Đặt chỗ"
      title="Tổng quan đặt chỗ"
      description="Admin xem tất cả đặt chỗ của người dùng, vị trí slot, biển số, thanh toán và trạng thái đặt chỗ."
    >
      {error && (
        <div className="mb-4 rounded-lg border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-100">
          {error}
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-3">
        <AdminStatCard label="Đặt chỗ" value={isLoading ? '-' : total} detail={`${paidBookings} đã thanh toán hoặc đã dùng`} />
        <AdminStatCard label="Chờ xử lý" value={pendingBookings} detail="Cần xác nhận hoặc thanh toán" />
        <AdminStatCard label="Doanh thu đã thanh toán" value={formatAdminCurrency(revenue)} detail="Từ các đặt chỗ đã thanh toán" />
      </div>

      <section className="liquid-glass-card mt-5 rounded-lg p-4 md:p-5">
        <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-subtle">Đặt chỗ</p>
            <h2 className="mt-1 text-base font-semibold text-fg">Tất cả đặt chỗ</h2>
          </div>
          <input
            className="auth-input h-10 w-full rounded-lg border px-3 text-sm text-fg md:w-56"
            placeholder="Tìm đặt chỗ"
            type="search"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[58rem] text-left text-sm">
            <thead className="border-b border-theme text-xs uppercase tracking-[0.14em] text-subtle">
              <tr>
                <th className="px-3 py-3 font-medium">Mã đặt chỗ</th>
                <th className="px-3 py-3 font-medium">Khách hàng</th>
                <th className="px-3 py-3 font-medium">Slot</th>
                <th className="px-3 py-3 font-medium">Thời gian</th>
                <th className="px-3 py-3 font-medium">Thanh toán</th>
                <th className="px-3 py-3 font-medium">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-theme">
              {isLoading && (
                <tr>
                  <td className="px-3 py-6 text-muted" colSpan={6}>Đang tải đặt chỗ...</td>
                </tr>
              )}
              {!isLoading && bookings.length === 0 && (
                <tr>
                  <td className="px-3 py-6 text-muted" colSpan={6}>Không tìm thấy đặt chỗ.</td>
                </tr>
              )}
              {!isLoading && bookings.map((booking) => {
                const user = typeof booking.userId === 'object' ? booking.userId : null
                const schedule = `${new Date(booking.expectedArrivalTime).toLocaleString('vi-VN')} - ${new Date(booking.expectedExitTime).toLocaleString('vi-VN')}`

                return (
                <tr key={booking._id} className="align-top">
                  <td className="px-3 py-4 font-semibold text-fg">{booking._id.slice(-8).toUpperCase()}</td>
                  <td className="px-3 py-4">
                    <p className="font-medium text-fg">{user?.fullName ?? booking.phoneNumber}</p>
                    <p className="mt-1 text-xs text-subtle">{booking.licensePlate}</p>
                  </td>
                  <td className="px-3 py-4">
                    <p className="font-medium text-fg">{vehicleTypeLabels[booking.vehicleType]}</p>
                    <p className="mt-1 text-xs text-subtle">{booking.durationHours} giờ</p>
                  </td>
                  <td className="px-3 py-4 text-muted">{schedule}</td>
                  <td className="px-3 py-4">
                    <p className="font-medium text-fg">{booking.status === 'pending' ? 'Chưa thanh toán' : 'Đã thanh toán'}</p>
                    <p className="mt-1 text-xs text-subtle">{formatAdminCurrency(booking.amount)}</p>
                  </td>
                  <td className="px-3 py-4">
                    <AdminStatusBadge status={booking.status} />
                  </td>
                </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </AdminPageShell>
  )
}
