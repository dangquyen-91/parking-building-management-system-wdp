import { GlassCard, Label } from "@/components/parking-ui";
import type { Subscription } from "@/types/subscriptions";
import {
  formatDate,
  formatDateTimeWithYear,
  formatMoney,
  formatVehicleType,
} from "@/utils/format";
import { Pressable, Text, View } from "@/tw";

const getSubscriptionTone = (status: Subscription["status"]) => {
  if (status === "active") {
    return "text-btn-primary";
  }

  if (status === "expired" || status === "cancelled") {
    return "text-faint";
  }

  return "text-fg";
};

type SubscriptionHistorySectionProps = {
  cancelPending: boolean;
  confirmPending: boolean;
  isFetching: boolean;
  isLoadingQrForId: string | null;
  onCancel: (subscriptionId: string) => void;
  onConfirm: (subscriptionId: string) => void;
  onOpenQr: (subscriptionId: string) => void;
  onRefresh: () => void;
  subscriptions: Subscription[];
};

export function SubscriptionHistorySection({
  cancelPending,
  confirmPending,
  isFetching,
  isLoadingQrForId,
  onCancel,
  onConfirm,
  onOpenQr,
  onRefresh,
  subscriptions,
}: SubscriptionHistorySectionProps) {
  return (
    <View className="gap-3">
      <View className="flex-row items-center justify-between">
        <View className="gap-1">
          <Label>My subscriptions</Label>
          <Text className="font-sans text-2xl font-black text-fg">
            Purchase history
          </Text>
        </View>
        <Pressable
          className="rounded-full border border-border-strong bg-badge px-4 py-2"
          disabled={isFetching}
          onPress={onRefresh}
        >
          <Text className="font-sans text-sm font-bold text-fg">
            {isFetching ? "Refreshing..." : "Refresh"}
          </Text>
        </Pressable>
      </View>

      {subscriptions.map((subscription) => (
        <GlassCard key={subscription._id} className="gap-3">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Text className="font-sans text-lg font-extrabold text-fg">
                {subscription.planId.name}
              </Text>
              <Text selectable className="font-sans text-sm text-subtle">
                {subscription.licensePlate}
              </Text>
            </View>
            <Text
              className={`font-sans text-xs font-extrabold uppercase ${getSubscriptionTone(
                subscription.status,
              )}`}
            >
              {subscription.status}
            </Text>
          </View>

          <View className="gap-1">
            <Text className="font-sans text-sm text-subtle">
              {formatVehicleType(subscription.vehicleType)} -{" "}
              {formatMoney(subscription.planId.price)}
            </Text>
            <Text className="font-sans text-sm text-subtle">
              Created: {formatDateTimeWithYear(subscription.createdAt)}
            </Text>
            <Text className="font-sans text-sm text-subtle">
              Valid: {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
            </Text>
            {subscription.slotId?.slotCode ? (
              <Text className="font-sans text-sm text-subtle">
                Slot: {subscription.slotId.slotCode}
              </Text>
            ) : null}
          </View>

          {subscription.status === "pending" ? (
            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 items-center rounded-full bg-btn-primary py-3"
                disabled={confirmPending}
                onPress={() => onConfirm(subscription._id)}
              >
                <Text className="font-sans text-sm font-extrabold text-btn-primary-fg">
                  Confirm payment
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 items-center rounded-full border border-border-strong bg-badge py-3"
                disabled={cancelPending}
                onPress={() => onCancel(subscription._id)}
              >
                <Text className="font-sans text-sm font-extrabold text-fg">
                  Cancel
                </Text>
              </Pressable>
            </View>
          ) : subscription.status === "active" ? (
            <Pressable
              className="items-center rounded-full border border-border-strong bg-badge py-3"
              disabled={isLoadingQrForId === subscription._id}
              onPress={() => onOpenQr(subscription._id)}
            >
              <Text className="font-sans text-sm font-extrabold text-fg">
                Open QR
              </Text>
            </Pressable>
          ) : null}
        </GlassCard>
      ))}

      {!isFetching && subscriptions.length === 0 ? (
        <GlassCard className="gap-1">
          <Text className="font-sans text-base font-extrabold text-fg">
            No subscriptions yet
          </Text>
          <Text className="font-sans text-sm text-subtle">
            Buy a resident plan above and it will appear here after creation.
          </Text>
        </GlassCard>
      ) : null}
    </View>
  );
}
