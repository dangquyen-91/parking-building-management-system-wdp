import { useEffect, useMemo, useState } from 'react'
import { Alert, AlertAction, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  ManagerBookingFilters,
  ManagerBookingList,
  ManagerBookingStats,
  ManagerPageHeader,
  type ManagerBookingStatusFilter,
} from '../../components/manager'
import { managerBookingsApi, type ManagerBooking } from '../../services/managerBookingsApi'

function normalizeSearch(value: string | number | null | undefined) {
  return String(value ?? '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '')
}

function getCustomerSearchText(booking: ManagerBooking) {
  if (!booking.userId || typeof booking.userId === 'string') return ''
  return `${booking.userId.fullName ?? ''} ${booking.userId.email ?? ''} ${booking.userId.phone ?? ''}`
}

function getBookingSearchText(booking: ManagerBooking) {
  return [
    booking._id,
    booking.licensePlate,
    booking.phone ?? '',
    booking.status,
    booking.amount,
    booking.durationHours,
    booking.expectedArrivalTime,
    booking.expectedExitTime,
    booking.createdAt,
    getCustomerSearchText(booking),
  ]
    .map(normalizeSearch)
    .join(' ')
}

export function ManagerBookingsPage() {
  const [bookings, setBookings] = useState<ManagerBooking[]>([])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ManagerBookingStatusFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function loadBookings() {
    setIsLoading(true)
    setError(null)
    try {
      const response = await managerBookingsApi.getBookings({ limit: 100 })
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
    const normalizedQuery = normalizeSearch(query)

    return bookings.filter((booking) => {
      const matchesQuery = !normalizedQuery || getBookingSearchText(booking).includes(normalizedQuery)

      if (!matchesQuery) return false
      if (statusFilter !== 'all' && booking.status !== statusFilter) return false
      return true
    })
  }, [bookings, query, statusFilter])

  return (
    <div className="relative mx-auto max-w-[118rem] p-4 md:p-8 lg:p-10">
      <ManagerPageHeader
        eyebrow="Quản lý // Lịch đặt"
        title="Quản lý lịch đặt"
        description="Theo dõi lịch đặt chỗ ô tô, trạng thái thanh toán, thời gian dự kiến và thông tin khách hàng."
        actions={
          <ManagerBookingFilters
            query={query}
            statusFilter={statusFilter}
            onQueryChange={setQuery}
            onStatusFilterChange={setStatusFilter}
          />
        }
      />

      <ManagerBookingStats bookings={bookings} isLoading={isLoading} />

      {error && (
        <Alert variant="destructive" className="mb-5">
          <AlertDescription>{error}</AlertDescription>
          <AlertAction>
            <Button type="button" variant="destructive" size="sm" onClick={() => void loadBookings()}>
              Thử lại
            </Button>
          </AlertAction>
        </Alert>
      )}

      <ManagerBookingList bookings={filteredBookings} isLoading={isLoading} />
    </div>
  )
}


