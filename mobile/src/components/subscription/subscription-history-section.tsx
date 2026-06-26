import { GlassCard, Label } from "@/components/parking-ui";
import type { Subscription } from "@/types/subscriptions";
import {
  formatDate,
  formatDateTimeWithYear,
  formatMoney,
  formatSubscriptionStatus,
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
  onCancel: (subscriptionId: string) => void;
  onConfirm: (subscriptionId: string) => void;
  onViewDetails: (subscriptionId: string) => void;
  subscriptions: Subscription[];
};

export function SubscriptionHistorySection({
  cancelPending,
  confirmPending,
  isFetching,
  onCancel,
  onConfirm,
  onViewDetails,
  subscriptions,
}: SubscriptionHistorySectionProps) {
  return (
    <View className="gap-3">
      <View className="gap-1">
        <View className="gap-1">
          <Label>Gói của tôi</Label>
          <Text className="font-sans text-2xl font-black text-fg">
            Lịch sử mua gói
          </Text>
        </View>
        {isFetching ? (
          <Text className="font-sans text-xs font-bold text-subtle">
            Đang làm mới...
          </Text>
        ) : null}
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
              {formatSubscriptionStatus(subscription.status)}
            </Text>
          </View>

          <View className="gap-1">
            <Text className="font-sans text-sm text-subtle">
              {formatVehicleType(subscription.vehicleType)} - {formatMoney(subscription.planId.price)}
            </Text>
            <Text className="font-sans text-sm text-subtle">
              Tạo lúc: {formatDateTimeWithYear(subscription.createdAt)}
            </Text>
            <Text className="font-sans text-sm text-subtle">
              Hiệu lực: {formatDate(subscription.startDate)} - {formatDate(subscription.endDate)}
            </Text>
            {subscription.slotId?.slotCode ? (
              <Text className="font-sans text-sm text-subtle">
                Chỗ đỗ: {subscription.slotId.slotCode}
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
                  Xác nhận thanh toán
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 items-center rounded-full border border-border-strong bg-badge py-3"
                disabled={cancelPending}
                onPress={() => onCancel(subscription._id)}
              >
                <Text className="font-sans text-sm font-extrabold text-fg">
                  Hủy
                </Text>
              </Pressable>
            </View>
          ) : subscription.status === "active" ? (
            <Pressable
              className="items-center rounded-full border border-border-strong bg-badge py-3"
              onPress={() => onViewDetails(subscription._id)}
            >
              <Text className="font-sans text-sm font-extrabold text-fg">
                Xem chi tiết
              </Text>
            </Pressable>
          ) : null}
        </GlassCard>
      ))}

      {!isFetching && subscriptions.length === 0 ? (
        <GlassCard className="gap-1">
          <Text className="font-sans text-base font-extrabold text-fg">
            Chưa có gói gửi xe nào
          </Text>
          <Text className="font-sans text-sm text-subtle">
            Hãy mua một gói cư dân ở phía trên, gói sẽ xuất hiện tại đây sau khi được tạo.
          </Text>
        </GlassCard>
      ) : null}
    </View>
  );
}
