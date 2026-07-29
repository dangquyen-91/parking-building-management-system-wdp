import { useMemo } from "react";
import Svg, { Rect } from "react-native-svg";
import { toQR } from "toqr";

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

const BOOKING_QR_SIZE = 164;
const BOOKING_QR_QUIET_ZONE = 4;

const encodeQrToken = (value: string) => {
  const bytes = new Uint8Array(value.length);
  for (let index = 0; index < value.length; index += 1) {
    bytes[index] = value.charCodeAt(index);
  }
  return bytes;
};

function BookingCredentialQr({ booking }: { booking: Booking | StoredGuestBooking }) {
  const qr = useMemo(() => {
    if (!booking.qrToken) {
      return null;
    }

    try {
      const modules = toQR(encodeQrToken(booking.qrToken), 0);
      const moduleSize = Math.sqrt(modules.length);

      if (!Number.isInteger(moduleSize)) {
        return null;
      }

      const paddedSize = moduleSize + BOOKING_QR_QUIET_ZONE * 2;
      return {
        cellSize: BOOKING_QR_SIZE / paddedSize,
        modules,
        moduleSize,
      };
    } catch {
      return null;
    }
  }, [booking.qrToken]);

  return (
    <View className="mt-1 items-center gap-2 rounded-[18px] border border-border bg-page p-3">
      <View className="h-[180px] w-[180px] items-center justify-center rounded-[14px] bg-white p-2">
        {qr ? (
          <Svg
            accessibilityLabel={`QR booking ${booking.licensePlate}`}
            height={BOOKING_QR_SIZE}
            width={BOOKING_QR_SIZE}
          >
            <Rect fill="#ffffff" height={BOOKING_QR_SIZE} width={BOOKING_QR_SIZE} x={0} y={0} />
            {Array.from(qr.modules).map((filled, index) => {
              if (!filled) return null;

              const row = Math.floor(index / qr.moduleSize);
              const column = index % qr.moduleSize;

              return (
                <Rect
                  fill="#000000"
                  height={qr.cellSize}
                  key={index}
                  width={qr.cellSize}
                  x={(column + BOOKING_QR_QUIET_ZONE) * qr.cellSize}
                  y={(row + BOOKING_QR_QUIET_ZONE) * qr.cellSize}
                />
              );
            })}
          </Svg>
        ) : (
          <Text className="text-center font-sans text-xs font-bold text-subtle">
            Không thể tạo QR. Vui lòng tải lại.
          </Text>
        )}
      </View>
      <Text className="font-sans text-xs font-extrabold uppercase text-btn-primary">
        QR vào / ra
      </Text>
      <Text selectable className="text-center font-sans text-[10px] text-faint">
        {booking.qrToken}
      </Text>
    </View>
  );
}

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
      {booking.status === "paid" && booking.qrToken ? (
        <BookingCredentialQr booking={booking} />
      ) : null}
    </GlassCard>
  );
}

type BookingHistorySectionProps = {
  bookings: Array<Booking | StoredGuestBooking>;
  emptyDescription: string;
  emptyTitle: string;
  isFetching: boolean;
  label: string;
  limit?: number;
  showEmail?: boolean;
};

export function BookingHistorySection({
  bookings,
  emptyDescription,
  emptyTitle,
  isFetching,
  label,
  limit,
  showEmail = false,
}: BookingHistorySectionProps) {
  const visibleBookings = typeof limit === "number" ? bookings.slice(0, limit) : bookings;

  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <Label>{label}</Label>
        {isFetching ? (
          <Text className="font-sans text-xs font-bold text-subtle">Đang tải</Text>
        ) : null}
      </View>

      {visibleBookings.map((booking) => (
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
