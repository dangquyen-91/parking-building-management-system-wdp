import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  BookingEmptyState,
  BookingTopNav,
  MyBookingList,
  MyBookingsHeader,
} from '../../components/booking'
import { AUTH_STORAGE_KEYS } from '../../services/authApi'
import { bookingApi, type Booking } from '../../services/bookingApi'

export function MyBookingsPage() {
  const token = localStorage.getItem(AUTH_STORAGE_KEYS.accessToken)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(Boolean(token))
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<string | null>(null)

  async function handleCancel(booking: Booking) {
    if (!window.confirm(`Hủy booking đang chờ thanh toán của biển số ${booking.licensePlate}?`)) return

    setError(null)
    setMessage(null)
    setCancellingId(booking._id)

    try {
      const result = await bookingApi.cancelBooking(booking._id)
      setBookings((current) => current.map((item) => (
        item._id === result.booking._id ? result.booking : item
      )))
      setMessage('Đã hủy booking thành công.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể hủy booking.')
    } finally {
      setCancellingId(null)
    }
  }

  useEffect(() => {
    if (!token) return

    let isActive = true

    bookingApi
      .getMyBookings()
      .then((response) => {
        if (isActive) setBookings(response.bookings ?? [])
      })
      .catch((err: unknown) => {
        if (isActive) {
          setError(err instanceof Error ? err.message : 'Không thể tải lịch sử đặt chỗ.')
        }
      })
      .finally(() => {
        if (isActive) setIsLoading(false)
      })

    return () => {
      isActive = false
    }
  }, [token])

  const stats = useMemo(() => {
    return {
      paid: bookings.filter((booking) => booking.status === 'paid').length,
      pending: bookings.filter((booking) => booking.status === 'pending').length,
      total: bookings.length,
    }
  }, [bookings])

  return (
    <div className="relative min-h-screen overflow-hidden bg-[linear-gradient(145deg,#fafafa_0%,#f5f3ff_52%,#f0f9ff_100%)] text-fg dark:bg-[linear-gradient(145deg,#0f1117_0%,#131122_52%,#0b1720_100%)]">
      <div className="pointer-events-none absolute -left-32 top-28 h-96 w-96 rounded-full bg-violet-300/10 blur-3xl" />
      <div className="pointer-events-none absolute -right-28 top-1/3 h-96 w-96 rounded-full bg-sky-300/10 blur-3xl" />
      <BookingTopNav />

      <main id="main" tabIndex={-1} className="relative z-10 mx-auto max-w-7xl px-4 pb-8 pt-24 md:px-8 md:pb-10 lg:px-10">
        <MyBookingsHeader paid={stats.paid} pending={stats.pending} total={stats.total} />

        {error && (
          <div className="mb-5 rounded-lg border border-rose-500/50 bg-rose-500/10 p-4 text-sm text-rose-700 dark:text-rose-100">
            {error}
          </div>
        )}
        {message && (
          <div className="mb-5 rounded-lg border border-emerald-500/50 bg-emerald-500/10 p-4 text-sm text-emerald-700 dark:text-emerald-100">
            {message}
          </div>
        )}

        <div className="mb-5 flex justify-end">
          <Link
            to="/booking"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-violet-600 to-sky-500 px-5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:-translate-y-0.5"
          >
            <span className="text-lg">+</span> Đặt chỗ mới
          </Link>
        </div>

        {!token ? (
          <BookingEmptyState title="Cần đăng nhập" description="Lịch sử đặt chỗ được liên kết với tài khoản của bạn. Hãy đăng nhập để xem các đơn đã tạo." link="/login" action="Đăng nhập" />
        ) : isLoading ? (
          <div className="rounded-2xl border border-violet-200 bg-white/75 p-6 text-sm text-violet-700 shadow-sm backdrop-blur dark:border-violet-700/40 dark:bg-slate-950/60 dark:text-violet-200">
            Đang tải lịch sử đặt chỗ...
          </div>
        ) : bookings.length === 0 ? (
          <BookingEmptyState title="Chưa có đặt chỗ" description="Tạo một đơn đặt chỗ ô tô trả trước, đơn sẽ xuất hiện tại đây sau khi hệ thống lưu vào tài khoản của bạn." link="/booking" action="Tạo đặt chỗ" />
        ) : (
          <MyBookingList bookings={bookings} cancellingId={cancellingId} onCancel={handleCancel} />
        )}
      </main>
    </div>
  )
}
