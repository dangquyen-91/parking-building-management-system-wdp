import type { ManagerBooking } from '../../../services/managerBookingsApi'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ManagerBookingCard } from './ManagerBookingCard'

type ManagerBookingListProps = {
  bookings: ManagerBooking[]
  isLoading: boolean
}

export function ManagerBookingList({ bookings, isLoading }: ManagerBookingListProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="grid gap-3 p-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (bookings.length === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-sm text-muted-foreground">Không có booking phù hợp.</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b">
        <div>
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Danh sách đặt chỗ</p>
          <CardTitle>Booking gần đây</CardTitle>
        </div>
        <Badge variant="outline">{bookings.length} booking</Badge>
      </CardHeader>
      <CardContent className="grid gap-3 p-4 md:p-5">
        {bookings.map((booking) => <ManagerBookingCard key={booking._id} booking={booking} />)}
      </CardContent>
    </Card>
  )
}


