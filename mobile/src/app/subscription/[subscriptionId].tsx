import { useEffect, useMemo, useState } from "react";
import { Image } from "expo-image";
import { Stack, useLocalSearchParams } from "expo-router";
import { toast } from "sonner-native";

import { AppRefreshControl } from "@/components/common/refresh-control";
import { GlassCard, Label, Page } from "@/components/parking-ui";
import { useCurrentUserQuery } from "@/hooks/useAuth";
import { useMySubscriptionsQuery, useSubscriptionQrMutation } from "@/hooks/useSubscriptions";
import type { Subscription } from "@/types/subscriptions";
import {
  formatDate,
  formatDateTimeWithYear,
  formatMoney,
  formatSubscriptionStatus,
  formatVehicleType,
} from "@/utils/format";
import { Pressable, ScrollView, Text, View } from "@/tw";

const getSingleParam = (value?: string | string[]) => (typeof value === "string" ? value : null);

const sortSubscriptions = (subscriptions: Subscription[]) =>
  [...subscriptions].sort(
    (left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
  );

export default function SubscriptionDetailsScreen() {
  const params = useLocalSearchParams<{
    subscriptionId?: string | string[];
  }>();
  const subscriptionId = getSingleParam(params.subscriptionId);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: currentUser } = useCurrentUserQuery();
  const mySubscriptionsQuery = useMySubscriptionsQuery(Boolean(currentUser));
  const subscriptionQrMutation = useSubscriptionQrMutation();
  const qrData = subscriptionQrMutation.data;

  const selectedSubscription = useMemo(() => {
    const subscriptions = sortSubscriptions(mySubscriptionsQuery.data?.subscriptions ?? []);

    if (!subscriptionId) {
      return null;
    }

    return subscriptions.find((subscription) => subscription._id === subscriptionId) ?? null;
  }, [mySubscriptionsQuery.data?.subscriptions, subscriptionId]);

  useEffect(() => {
    if (!selectedSubscription || selectedSubscription.status !== "active") {
      return;
    }

    if (qrData?.subscriptionId === selectedSubscription._id) {
      return;
    }

    if (subscriptionQrMutation.isPending) {
      return;
    }

    subscriptionQrMutation.mutate(selectedSubscription._id);
  }, [qrData?.subscriptionId, selectedSubscription, subscriptionQrMutation]);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      const result = await mySubscriptionsQuery.refetch();

      if (result.isSuccess && selectedSubscription?.status === "active") {
        await subscriptionQrMutation.mutateAsync(selectedSubscription._id);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleReloadQr = async () => {
    if (!selectedSubscription || selectedSubscription.status !== "active") {
      return;
    }

    try {
      await subscriptionQrMutation.mutateAsync(selectedSubscription._id);
      toast.success("Đã làm mới mã QR");
    } catch (error) {
      toast.error("Không thể tải mã QR", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau.",
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          headerBackTitle: "Quay lại",
          headerTitle: "Chi tiết gói gửi xe",
        }}
      />

      <Page
        eyebrow="Ra vào cư dân"
        title="Chi tiết gói gửi xe"
        subtitle="Xem gói gửi xe cư dân, chỗ đỗ được cấp và mã QR ra vào tại một nơi."
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-4 px-5 pb-[120px]"
          refreshControl={
            <AppRefreshControl
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
            />
          }
        >
          {!currentUser ? (
            <GlassCard className="gap-2">
              <Text className="font-sans text-base font-extrabold text-fg">
                Cần đăng nhập
              </Text>
              <Text className="font-sans text-sm text-subtle">
                Đăng nhập để xem chi tiết gói cư dân và mã QR của bạn.
              </Text>
            </GlassCard>
          ) : mySubscriptionsQuery.isLoading ? (
            <GlassCard className="gap-2">
              <Text className="font-sans text-base font-extrabold text-fg">
                Đang tải gói gửi xe...
              </Text>
              <Text className="font-sans text-sm text-subtle">
                Đang lấy dữ liệu gói cư dân mới nhất của bạn.
              </Text>
            </GlassCard>
          ) : !selectedSubscription ? (
            <GlassCard className="gap-2">
              <Text className="font-sans text-base font-extrabold text-fg">
                Không tìm thấy gói gửi xe
              </Text>
              <Text className="font-sans text-sm text-subtle">
                Gói này có thể không còn tồn tại hoặc không thuộc tài khoản của bạn.
              </Text>
            </GlassCard>
          ) : (
            <>
              <GlassCard className="gap-4">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 gap-1">
                    <Label>Gói cư dân</Label>
                    <Text className="font-sans text-2xl font-black text-fg">
                      {selectedSubscription.planId.name}
                    </Text>
                    <Text className="font-sans text-sm text-subtle">
                      {formatVehicleType(selectedSubscription.vehicleType)} -{" "}
                      {formatMoney(selectedSubscription.planId.price)}
                    </Text>
                  </View>
                  <View className="rounded-full bg-badge px-3 py-1.5">
                    <Text className="font-sans text-xs font-bold uppercase text-fg">
                      {formatSubscriptionStatus(selectedSubscription.status)}
                    </Text>
                  </View>
                </View>

                <View className="gap-2 rounded-[14px] bg-surface-alt p-3">
                  <Text selectable className="font-sans text-lg font-extrabold text-fg">
                    {selectedSubscription.licensePlate}
                  </Text>
                  <Text className="font-sans text-sm text-subtle">
                    Tạo lúc: {formatDateTimeWithYear(selectedSubscription.createdAt)}
                  </Text>
                  <Text className="font-sans text-sm text-subtle">
                    Hiệu lực: {formatDate(selectedSubscription.startDate)} -{" "}
                    {formatDate(selectedSubscription.endDate)}
                  </Text>
                </View>
              </GlassCard>

              <GlassCard className="gap-3">
                <View className="gap-1">
                  <Label>Chỗ đỗ được cấp</Label>
                  <Text className="font-sans text-xl font-extrabold text-fg">
                    {selectedSubscription.slotId?.slotCode ?? "Chưa có chỗ cố định"}
                  </Text>
                </View>
                <Text className="font-sans text-sm text-subtle">
                  {selectedSubscription.slotId?.floorId?.floorNumber
                    ? `Tầng B${selectedSubscription.slotId.floorId.floorNumber}`
                    : "Gói này hiện chưa bao gồm chỗ đỗ cố định."}
                </Text>
              </GlassCard>

              <GlassCard className="items-center gap-4">
                <View className="items-center gap-1">
                  <Label>Mã QR ra vào</Label>
                  <Text className="font-sans text-xl font-extrabold text-fg">
                    Mã ra vào cư dân
                  </Text>
                </View>

                {selectedSubscription.status !== "active" ? (
                  <View className="items-center gap-2">
                    <Text className="font-sans text-sm font-bold text-fg">
                      QR sẽ xuất hiện sau khi kích hoạt
                    </Text>
                    <Text className="text-center font-sans text-sm leading-5 text-subtle">
                      Hãy hoàn tất thanh toán và xác nhận gói trước khi dùng cổng ra vào cư dân.
                    </Text>
                  </View>
                ) : subscriptionQrMutation.isPending &&
                  qrData?.subscriptionId !== selectedSubscription._id ? (
                  <View className="items-center gap-2 py-10">
                    <Text className="font-sans text-base font-extrabold text-fg">
                      Đang tải mã QR...
                    </Text>
                    <Text className="text-center font-sans text-sm text-subtle">
                      Đang lấy mã ra vào cư dân mới nhất của bạn.
                    </Text>
                  </View>
                ) : qrData?.subscriptionId === selectedSubscription._id ? (
                  <>
                    <GlassCard className="items-center gap-3 self-stretch">
                      <Image
                        contentFit="contain"
                        source={{ uri: qrData.qrImage }}
                        style={{ width: 260, height: 260 }}
                      />
                      <Text className="font-sans text-lg font-extrabold text-fg">
                        {qrData.licensePlate}
                      </Text>
                    </GlassCard>

                    <Pressable
                      className="items-center rounded-full bg-btn-primary px-5 py-3.5"
                      disabled={subscriptionQrMutation.isPending}
                      onPress={handleReloadQr}
                    >
                      <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                        Làm mới mã QR
                      </Text>
                    </Pressable>
                  </>
                ) : (
                  <Pressable
                    className="items-center rounded-full bg-btn-primary px-5 py-3.5"
                    disabled={subscriptionQrMutation.isPending}
                    onPress={handleReloadQr}
                  >
                    <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                      Tải mã QR
                    </Text>
                  </Pressable>
                )}
              </GlassCard>
            </>
          )}
        </ScrollView>
      </Page>
    </>
  );
}
