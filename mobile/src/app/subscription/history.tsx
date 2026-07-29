import { useMemo, useState } from "react";
import { Stack, useRouter } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";

import { AppRefreshControl } from "@/components/common/refresh-control";
import { GlassCard, Page } from "@/components/parking-ui";
import { SubscriptionHistorySection } from "@/components/subscription";
import { useCurrentUserQuery } from "@/hooks/useAuth";
import {
  useCancelSubscriptionMutation,
  useConfirmSubscriptionMutation,
  useMySubscriptionsQuery,
} from "@/hooks/useSubscriptions";
import {
  formatSubscriptionStatus,
  formatVehicleType,
} from "@/utils/format";
import { Pressable, ScrollView, Text, TextInput, View, useThemeColors } from "@/tw";

const inputStyle = {
  paddingHorizontal: 16,
  paddingVertical: 14,
};

const normalizeSearchText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function SubscriptionHistoryScreen() {
  const router = useRouter();
  const { placeholder } = useThemeColors();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: currentUser } = useCurrentUserQuery();
  const mySubscriptionsQuery = useMySubscriptionsQuery(Boolean(currentUser));
  const confirmSubscriptionMutation = useConfirmSubscriptionMutation();
  const cancelSubscriptionMutation = useCancelSubscriptionMutation();
  const subscriptions = mySubscriptionsQuery.data?.subscriptions ?? [];
  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const filteredSubscriptions = useMemo(() => {
    if (!normalizedSearchQuery) {
      return subscriptions;
    }

    return subscriptions.filter((subscription) => {
      const searchableText = normalizeSearchText(
        [
          subscription.planId.name,
          subscription.planId.code,
          subscription.planId.description,
          subscription.licensePlate,
          subscription.status,
          formatSubscriptionStatus(subscription.status),
          subscription.vehicleType,
          formatVehicleType(subscription.vehicleType),
          subscription.slotId?.slotCode,
        ]
          .filter(Boolean)
          .join(" "),
      );

      return searchableText.includes(normalizedSearchQuery);
    });
  }, [normalizedSearchQuery, subscriptions]);

  const handleOpenSubscriptionDetails = (subscriptionId?: string) => {
    if (!subscriptionId) {
      return;
    }

    router.push({
      pathname: "/subscription/[subscriptionId]",
      params: { subscriptionId },
    });
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      const result = await mySubscriptionsQuery.refetch();

      if (result.isSuccess) {
        toast.success("Đã làm mới danh sách gói");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          headerBackTitle: "Quay lại",
          headerTitle: "Các gói của tôi",
        }}
      />

      <Page
        eyebrow="Gói cư dân"
        title="Các gói của tôi"
        subtitle="Xem toàn bộ gói đã mua, xác nhận thanh toán dang dở và mở chi tiết từng gói."
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
                Đăng nhập để xem toàn bộ gói gửi xe của bạn.
              </Text>
            </GlassCard>
          ) : (
            <>
              <View className="gap-2">
                <Text className="font-sans text-xs font-bold uppercase text-faint">
                  Tìm kiếm
                </Text>
                <View className="flex-row items-center rounded-[14px] border border-border-theme bg-input">
                  <Ionicons
                    name="search"
                    color={placeholder}
                    size={18}
                    style={{ marginLeft: 14 }}
                  />
                  <TextInput
                    autoCapitalize="none"
                    className="flex-1 font-sans text-base text-fg"
                    onChangeText={setSearchQuery}
                    placeholder="Tìm theo gói, biển số, trạng thái, chỗ đỗ"
                    placeholderTextColor={placeholder}
                    style={inputStyle}
                    value={searchQuery}
                  />
                  {searchQuery ? (
                    <Pressable className="px-4 py-3.5" onPress={() => setSearchQuery("")}>
                      <Ionicons name="close-circle" color={placeholder} size={18} />
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <SubscriptionHistorySection
                cancelPending={cancelSubscriptionMutation.isPending}
                confirmPending={confirmSubscriptionMutation.isPending}
                emptyDescription={
                  normalizedSearchQuery
                    ? "Thử nhập tên gói, biển số, trạng thái hoặc mã chỗ khác."
                    : undefined
                }
                emptyTitle={normalizedSearchQuery ? "Không tìm thấy gói phù hợp" : undefined}
                isFetching={mySubscriptionsQuery.isFetching}
                onCancel={(subscriptionId) => {
                  cancelSubscriptionMutation
                    .mutateAsync(subscriptionId)
                    .then(() => {
                      toast.success("Đã hủy gói gửi xe");
                    })
                    .catch((error: unknown) => {
                      toast.error("Hủy gói thất bại", {
                        description:
                          error instanceof Error ? error.message : "Vui lòng thử lại sau.",
                      });
                    });
                }}
                onConfirm={(subscriptionId) => {
                  confirmSubscriptionMutation
                    .mutateAsync(subscriptionId)
                    .then((result) => {
                      toast.success("Đã đồng bộ gói gửi xe");
                      handleOpenSubscriptionDetails(result.subscription._id);
                    })
                    .catch((error: unknown) => {
                      toast.error("Đồng bộ thất bại", {
                        description:
                          error instanceof Error ? error.message : "Vui lòng thử lại sau.",
                      });
                    });
                }}
                onViewDetails={handleOpenSubscriptionDetails}
                subscriptions={filteredSubscriptions}
              />
            </>
          )}
        </ScrollView>
      </Page>
    </>
  );
}
