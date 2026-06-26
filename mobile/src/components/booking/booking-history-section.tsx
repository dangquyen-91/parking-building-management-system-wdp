import type { Booking, StoredGuestBooking } from "@/types/bookings";
import { GlassCard, Label } from "@/components/parking-ui";
import { formatBookingStatus, formatDateTime, formatMoney } from "@/utils/format";
import { Text, View } from "@/tw";

const getStatusTone = (status: Booking["status"]) => {
  if (status === "paid" || status === "used") {
    return "text-btn-primary";
  }

  if (status === "cancelled" || status === "expired") {
    return "text-faint";
  }

  return "text-fg";
};

function BookingHistoryCard({
  booking,
  showEmail,
}: {
  booking: Booking | StoredGuestBooking;
  showEmail: boolean;
}) {
  return (
    <GlassCard className="gap-2.5">
      <View className="flex-row items-center justify-between gap-3">
        <View className="flex-1 gap-1">
          <Text selectable className="font-sans text-base font-extrabold text-fg">
            {booking.licensePlate}
          </Text>
          {showEmail ? (
            <Text className="font-sans text-sm text-subtle">
              {(booking as StoredGuestBooking).email}
            </Text>
          ) : null}
        </View>
        <Text
          className={`font-sans text-xs font-extrabold uppercase ${getStatusTone(
            booking.status,
          )}`}
        >
          {formatBookingStatus(booking.status)}
        </Text>
      </View>
      <Text className="font-sans text-sm text-subtle">
        {formatDateTime(booking.expectedArrivalTime)} - {formatDateTime(booking.expectedExitTime)}
      </Text>
      <Text className="font-sans text-sm font-bold text-muted">
        {formatMoney(booking.amount)}
      </Text>
    </GlassCard>
  );
}

type BookingHistorySectionProps = {
  bookings: Array<Booking | StoredGuestBooking>;
  emptyDescription: string;
  emptyTitle: string;
  isFetching: boolean;
  label: string;
  showEmail?: boolean;
};

export function BookingHistorySection({
  bookings,
  emptyDescription,
  emptyTitle,
  isFetching,
  label,
  showEmail = false,
}: BookingHistorySectionProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Label>{label}</Label>
        {isFetching ? (
          <Text className="font-sans text-xs font-bold text-subtle">Đang tải</Text>
        ) : null}
      </View>

      {bookings.slice(0, 3).map((booking) => (
        <BookingHistoryCard key={booking._id} booking={booking} showEmail={showEmail} />
      ))}

      {!isFetching && bookings.length === 0 ? (
        <GlassCard className="gap-1">
          <Text className="font-sans text-base font-extrabold text-fg">
            {emptyTitle}
          </Text>
          <Text className="font-sans text-sm text-subtle">{emptyDescription}</Text>
        </GlassCard>
      ) : null}
    </View>
  );
}
