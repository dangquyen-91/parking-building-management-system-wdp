import { GlassCard, Label } from "@/components/parking-ui";
import type { PurchaseSubscriptionResult } from "@/types/subscriptions";
import { formatMoney, formatSubscriptionStatus } from "@/utils/format";
import { Pressable, Text, View } from "@/tw";

type SubscriptionPaymentCardProps = {
  onOpenPayment: (url: string) => void;
  purchaseResult: PurchaseSubscriptionResult;
};

export function SubscriptionPaymentCard({
  onOpenPayment,
  purchaseResult,
}: SubscriptionPaymentCardProps) {
  return (
    <GlassCard className="gap-4">
      <View className="flex-row items-start justify-between gap-3">
        <View className="flex-1 gap-1">
          <Label>Đang chờ thanh toán</Label>
          <Text className="font-sans text-xl font-extrabold text-fg">
            {formatMoney(purchaseResult.payment.amount)}
          </Text>
          <Text className="font-sans text-sm text-subtle">
            Đơn hàng #{purchaseResult.payment.orderCode}
          </Text>
        </View>
        <Text className="rounded-full bg-badge px-3 py-1 font-sans text-xs font-bold uppercase text-fg">
          {formatSubscriptionStatus(purchaseResult.subscription.status)}
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
            Mở trang thanh toán
          </Text>
        </Pressable>
      </View>
    </GlassCard>
  );
}
