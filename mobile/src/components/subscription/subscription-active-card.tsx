import { GlassCard, Label } from "@/components/parking-ui";
import type { Subscription } from "@/types/subscriptions";
import { formatDate, formatSubscriptionStatus } from "@/utils/format";
import { Pressable, Text, View } from "@/tw";

type SubscriptionActiveCardProps = {
  onViewDetails: (subscriptionId: string) => void;
  subscription: Subscription;
};

export function SubscriptionActiveCard({
  onViewDetails,
  subscription,
}: SubscriptionActiveCardProps) {
  return (
    <GlassCard className="gap-4">
      <View className="flex-row items-center justify-between gap-3">
        <View className="gap-1">
          <Label>Gói đang hoạt động</Label>
          <Text className="font-sans text-xl font-extrabold text-fg">
            {subscription.planId.name}
          </Text>
        </View>
        <Text className="font-sans text-xs font-extrabold uppercase text-btn-primary">
          {formatSubscriptionStatus(subscription.status)}
        </Text>
      </View>

      <View className="gap-2 rounded-[14px] bg-surface-alt p-3">
        <Text selectable className="font-sans text-base font-extrabold text-fg">
          {subscription.licensePlate}
        </Text>
        <Text className="font-sans text-sm text-subtle">
          Có hiệu lực đến {formatDate(subscription.endDate)}
        </Text>
        {subscription.slotId?.slotCode ? (
          <Text className="font-sans text-sm text-subtle">
            Chỗ đã giữ: {subscription.slotId.slotCode}
          </Text>
        ) : null}
      </View>

      <Pressable
        className="items-center rounded-full bg-btn-primary py-3.5"
        onPress={() => onViewDetails(subscription._id)}
      >
        <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
          Xem chi tiết gói gửi xe
        </Text>
      </Pressable>
    </GlassCard>
  );
}
