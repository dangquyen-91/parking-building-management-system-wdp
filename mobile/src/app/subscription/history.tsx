import { useState } from "react";
import { Stack, useRouter } from "expo-router";
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
import { ScrollView, Text } from "@/tw";

export default function SubscriptionHistoryScreen() {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: currentUser } = useCurrentUserQuery();
  const mySubscriptionsQuery = useMySubscriptionsQuery(Boolean(currentUser));
  const confirmSubscriptionMutation = useConfirmSubscriptionMutation();
  const cancelSubscriptionMutation = useCancelSubscriptionMutation();

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
            <SubscriptionHistorySection
              cancelPending={cancelSubscriptionMutation.isPending}
              confirmPending={confirmSubscriptionMutation.isPending}
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
              subscriptions={mySubscriptionsQuery.data?.subscriptions ?? []}
            />
          )}
        </ScrollView>
      </Page>
    </>
  );
}
