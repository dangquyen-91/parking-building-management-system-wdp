import { GlassCard, Label } from "@/components/parking-ui";
import { formatMoney } from "@/utils/format";
import { Text, View } from "@/tw";

type BookingEstimateCardProps = {
  estimatedAmount: number | null;
  selectedDurationHours: number | null;
};

export function BookingEstimateCard({
  estimatedAmount,
  selectedDurationHours,
}: BookingEstimateCardProps) {
  return (
    <GlassCard className="gap-3">
      <View className="flex-row items-center justify-between">
        <View className="gap-1">
          <Label>Estimate</Label>
          <Text className="font-sans text-xl font-extrabold text-fg">
            {estimatedAmount ? formatMoney(estimatedAmount) : "Check time range"}
          </Text>
        </View>
        <View className="items-end gap-1">
          <Label>Duration</Label>
          <Text className="font-sans text-base font-bold text-muted">
            {selectedDurationHours ? `${selectedDurationHours}h` : "--"}
          </Text>
        </View>
      </View>
      <Text className="font-sans text-sm leading-5 text-subtle">
        Car parking is charged at 35,000 VND per 4-hour block, rounded up. For
        example, 5-8 hours is 70,000 VND and 9-12 hours is 105,000 VND.
      </Text>
    </GlassCard>
  );
}
