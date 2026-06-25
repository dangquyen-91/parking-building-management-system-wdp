import { GlassCard, Label } from "@/components/parking-ui";
import type { PurchaseSubscriptionResult } from "@/types/subscriptions";
import { formatMoney } from "@/utils/format";
import { Pressable, Text, View } from "@/tw";

const getSubscriptionTone = (status: PurchaseSubscriptionResult["subscription"]["status"]) => {
  if (status === "active") {
    return "text-btn-primary";
  }

  if (status === "expired" || status === "cancelled") {
    return "text-faint";
  }

  return "text-fg";
};

type SubscriptionPaymentCardProps = {
  confirmPending: boolean;
  onOpenPayment: (url: string) => void;
  onSyncStatus: () => void;
  purchaseResult: PurchaseSubscriptionResult;
};

export function SubscriptionPaymentCard({
  confirmPending,
  onOpenPayment,
  onSyncStatus,
  purchaseResult,
}: SubscriptionPaymentCardProps) {
  return (
    <GlassCard className="gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Label>Payment pending</Label>
          <Text className="font-sans text-xl font-extrabold text-fg">
            {formatMoney(purchaseResult.payment.amount)}
          </Text>
          <Text className="font-sans text-sm text-subtle">
            Order #{purchaseResult.payment.orderCode}
          </Text>
        </View>
        <Text
          className={`rounded-full bg-badge px-3 py-1 font-sans text-xs font-bold uppercase ${getSubscriptionTone(
            purchaseResult.subscription.status,
          )}`}
        >
          {purchaseResult.subscription.status}
        </Text>
      </View>

      <View className="gap-2 rounded-[14px] bg-surface-alt p-3">
        <Text selectable className="font-sans text-base font-extrabold text-fg">
          {purchaseResult.subscription.licensePlate}
        </Text>
        <Text className="font-sans text-sm text-subtle">
          {purchaseResult.subscription.planId.name}
        </Text>
      </View>

      <View className="flex-row gap-3">
        <Pressable
          className="flex-1 items-center rounded-full bg-btn-primary py-3.5"
          onPress={() => onOpenPayment(purchaseResult.payment.checkoutUrl)}
        >
          <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
            Open payment
          </Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}
