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
          <Label>Chi phí dự kiến</Label>
          <Text className="font-sans text-xl font-extrabold text-fg">
            {estimatedAmount ? formatMoney(estimatedAmount) : "Chọn khung thời gian"}
          </Text>
        </View>
        <View className="items-end gap-1">
          <Label>Thời lượng</Label>
          <Text className="font-sans text-base font-bold text-muted">
            {selectedDurationHours ? `${selectedDurationHours} giờ` : "--"}
          </Text>
        </View>
      </View>
      <Text className="font-sans text-sm leading-5 text-subtle">
        Ô tô được tính 35.000 VND cho mỗi block 4 giờ và sẽ làm tròn lên. Ví dụ 5-8 giờ là 70.000
        VND, còn 9-12 giờ là 105.000 VND.
      </Text>
    </GlassCard>
  );
}
