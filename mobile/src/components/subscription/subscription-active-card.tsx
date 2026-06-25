import { GlassCard, Label } from "@/components/parking-ui";
import type { Subscription } from "@/types/subscriptions";
import { formatDate } from "@/utils/format";
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
          <Label>Active subscription</Label>
          <Text className="font-sans text-xl font-extrabold text-fg">
            {subscription.planId.name}
          </Text>
        </View>
        <Text className="font-sans text-xs font-extrabold uppercase text-btn-primary">
          {subscription.status}
        </Text>
      </View>

      <View className="gap-2 rounded-[14px] bg-surface-alt p-3">
        <Text selectable className="font-sans text-base font-extrabold text-fg">
          {subscription.licensePlate}
        </Text>
        <Text className="font-sans text-sm text-subtle">
          Valid until {formatDate(subscription.endDate)}
        </Text>
        {subscription.slotId?.slotCode ? (
          <Text className="font-sans text-sm text-subtle">
            Reserved slot: {subscription.slotId.slotCode}
          </Text>
        ) : null}
      </View>

      <Pressable
        className="items-center rounded-full bg-btn-primary py-3.5"
        onPress={() => onViewDetails(subscription._id)}
      >
        <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
          View subscription details
        </Text>
      </Pressable>
    </GlassCard>
  );
}
