import { GlassCard, Label } from "@/components/parking-ui";
import {
  CAR_DAILY_CAP,
  CAR_HOURLY_DAY,
  CAR_HOURLY_NIGHT,
  computeBookingBreakdown,
} from "@/components/booking/booking-utils";
import { formatMoney } from "@/utils/format";
import { Text, View } from "@/tw";

type BookingEstimateCardProps = {
  arrivalTime: Date | null;
  estimatedAmount: number | null;
  selectedDurationHours: number | null;
};

export function BookingEstimateCard({
  arrivalTime,
  estimatedAmount,
  selectedDurationHours,
}: BookingEstimateCardProps) {
  const breakdown =
    arrivalTime && selectedDurationHours
      ? computeBookingBreakdown(arrivalTime, selectedDurationHours)
      : null;

  return (
    <GlassCard className="gap-3">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 gap-1 pr-3">
          <Label>Chi phí dự kiến</Label>
          <Text className="font-sans text-xl font-extrabold text-fg">
            {estimatedAmount
              ? formatMoney(estimatedAmount)
              : "Chọn thời gian đến và thời lượng"}
          </Text>
        </View>
        <View className="items-end gap-1">
          <Label>Thời lượng</Label>
          <Text className="font-sans text-base font-bold text-muted">
            {selectedDurationHours ? `${selectedDurationHours} giờ` : "--"}
          </Text>
        </View>
      </View>

      {breakdown ? (
        <View className="gap-2 rounded-[14px] border border-border-theme bg-input p-3">
          {breakdown.dayHours > 0 ? (
            <View className="flex-row items-center justify-between gap-3">
              <Text className="flex-1 font-sans text-sm text-subtle">
                Ban ngày {breakdown.dayHours} giờ x {formatMoney(CAR_HOURLY_DAY)}/giờ
              </Text>
              <Text className="font-sans text-sm font-bold text-fg">
                {formatMoney(breakdown.dayFee)}
              </Text>
            </View>
          ) : null}
          {breakdown.nightHours > 0 ? (
            <View className="flex-row items-center justify-between gap-3">
              <Text className="flex-1 font-sans text-sm text-subtle">
                Ban đêm {breakdown.nightHours} giờ x {formatMoney(CAR_HOURLY_NIGHT)}/giờ
              </Text>
              <Text className="font-sans text-sm font-bold text-fg">
                {formatMoney(breakdown.nightFee)}
              </Text>
            </View>
          ) : null}
          {breakdown.capped ? (
            <Text className="font-sans text-xs leading-5 text-subtle">
              Đã áp trần {formatMoney(CAR_DAILY_CAP)}/ngày theo công thức BE.
            </Text>
          ) : null}
        </View>
      ) : null}

      <Text className="font-sans text-sm leading-5 text-subtle">
        Ô tô được tính theo giờ: ban ngày {formatMoney(CAR_HOURLY_DAY)}/giờ, ban đêm 22h-5h{" "}
        {formatMoney(CAR_HOURLY_NIGHT)}/giờ, làm tròn lên từng giờ và áp trần{" "}
        {formatMoney(CAR_DAILY_CAP)}/ngày.
      </Text>
    </GlassCard>
  );
}
