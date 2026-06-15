import { useEffect, useMemo, useState } from 'react'
import {
  ManagerBookingFilters,
  ManagerBookingList,
  ManagerBookingStats,
  type ManagerBookingStatusFilter,
} from '../components/manager'
import { AdminPageShell } from '../components/admin'
import { adminApi, type AdminBooking } from '../services/adminApi'
import type { ManagerBooking } from '../services/managerBookingsApi'

function getCustomerSearchText(booking: AdminBooking) {
  if (!booking.userId || typeof booking.userId === 'string') return ''
  return `${booking.userId.fullName ?? ''} ${booking.userId.email ?? ''}`.toLowerCase()
}

export function AdminBookingsPage() {
  const [bookings, setBookings] = useState<AdminBooking[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ManagerBookingStatusFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadBookings() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await adminApi.getBookings({ limit: 100 })
      setBookings(response.bookings ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách booking.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => void loadBookings(), 0)
    return () => window.clearTimeout(timeoutId)
  }, [])

  const filteredBookings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase().replace(/\s/g, '')

    return bookings.filter((booking) => {
      const matchesQuery =
        !normalizedQuery ||
        booking.licensePlate.toLowerCase().replace(/\s/g, '').includes(normalizedQuery) ||
        booking.phoneNumber.toLowerCase().replace(/\s/g, '').includes(normalizedQuery) ||
        getCustomerSearchText(booking).replace(/\s/g, '').includes(normalizedQuery)

      if (!matchesQuery) return false
      if (statusFilter !== 'all' && booking.status !== statusFilter) return false
      return true
    })
  }, [bookings, query, statusFilter])

  return (
    <AdminPageShell
      eyebrow="Admin // Booking"
      title="Quản lý booking"
      description="Theo dõi lịch đặt chỗ ô tô, trạng thái thanh toán, thời gian dự kiến và thông tin khách hàng trên toàn hệ thống."
      actions={
        <ManagerBookingFilters
          query={query}
          statusFilter={statusFilter}
          onQueryChange={setQuery}
          onStatusFilterChange={setStatusFilter}
        />
      }
    >
      <ManagerBookingStats bookings={bookings as ManagerBooking[]} isLoading={isLoading} />

      {error && (
        <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-theme bg-rose-500/10 p-4 text-sm text-rose-200">
          <span>{error}</span>
          <button type="button" className="font-semibold hover:underline" onClick={() => void loadBookings()}>
            Thử lại
          </button>
        </div>
      )}

      <ManagerBookingList bookings={filteredBookings as ManagerBooking[]} isLoading={isLoading} />
    </AdminPageShell>
  )
}
