import type { CreateBookingResult } from "@/types/bookings";
import { GlassCard, Label } from "@/components/parking-ui";
import { formatDateTime, formatMoney } from "@/utils/format";
import { Pressable, Text, View } from "@/tw";

type BookingPaymentCardProps = {
  bookingResult: CreateBookingResult;
  onOpenPayment: (url?: string) => void;
};

export function BookingPaymentCard({
  bookingResult,
  onOpenPayment,
}: BookingPaymentCardProps) {
  return (
    <GlassCard className="gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Label>Payment required</Label>
          <Text className="font-sans text-xl font-extrabold text-fg">
            {formatMoney(bookingResult.payment.amount)}
          </Text>
          <Text className="font-sans text-sm text-subtle">
            Order #{bookingResult.payment.orderCode}
          </Text>
        </View>
        <Text className="rounded-full bg-badge px-3 py-1 font-sans text-xs font-bold uppercase text-fg">
          {bookingResult.booking.status}
        </Text>
      </View>

      <View className="gap-2 rounded-[14px] bg-surface-alt p-3">
        <Text selectable className="font-sans text-base font-extrabold text-fg">
          {bookingResult.booking.licensePlate}
        </Text>
        <Text className="font-sans text-sm text-subtle">
          {formatDateTime(bookingResult.booking.expectedArrivalTime)} -{" "}
          {formatDateTime(bookingResult.booking.expectedExitTime)}
        </Text>
      </View>

      <Pressable
        className="items-center rounded-full bg-btn-primary py-3.5"
        onPress={() => onOpenPayment(bookingResult.payment.checkoutUrl)}
      >
        <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
          Open payment
        </Text>
      </Pressable>
    </GlassCard>
  );
}
