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
  formatVehicleType,
} from "@/utils/format";
import { Pressable, ScrollView, Text, View } from "@/tw";

const getSingleParam = (value?: string | string[]) =>
  typeof value === "string" ? value : null;

const sortSubscriptions = (subscriptions: Subscription[]) =>
  [...subscriptions].sort(
    (left, right) =>
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime(),
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
      toast.success("QR refreshed");
    } catch (error) {
      toast.error("Cannot load QR", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          headerBackTitle: "Back",
          headerTitle: "Subscription details",
        }}
      />

      <Page
        eyebrow="Resident access"
        title="Subscription details"
        subtitle="Review your resident parking plan, assigned slot, and entry QR in one place."
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
                Sign in required
              </Text>
              <Text className="font-sans text-sm text-subtle">
                Sign in to view your resident subscription details and QR code.
              </Text>
            </GlassCard>
          ) : mySubscriptionsQuery.isLoading ? (
            <GlassCard className="gap-2">
              <Text className="font-sans text-base font-extrabold text-fg">
                Loading subscription...
              </Text>
              <Text className="font-sans text-sm text-subtle">
                Pulling your latest resident subscription data.
              </Text>
            </GlassCard>
          ) : !selectedSubscription ? (
            <GlassCard className="gap-2">
              <Text className="font-sans text-base font-extrabold text-fg">
                Subscription not found
              </Text>
              <Text className="font-sans text-sm text-subtle">
                This subscription may no longer exist or does not belong to your account.
              </Text>
            </GlassCard>
          ) : (
            <>
              <GlassCard className="gap-4">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 gap-1">
                    <Label>Resident plan</Label>
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
                      {selectedSubscription.status}
                    </Text>
                  </View>
                </View>

                <View className="gap-2 rounded-[14px] bg-surface-alt p-3">
                  <Text selectable className="font-sans text-lg font-extrabold text-fg">
                    {selectedSubscription.licensePlate}
                  </Text>
                  <Text className="font-sans text-sm text-subtle">
                    Created: {formatDateTimeWithYear(selectedSubscription.createdAt)}
                  </Text>
                  <Text className="font-sans text-sm text-subtle">
                    Valid: {formatDate(selectedSubscription.startDate)} -{" "}
                    {formatDate(selectedSubscription.endDate)}
                  </Text>
                </View>
              </GlassCard>

              <GlassCard className="gap-3">
                <View className="gap-1">
                  <Label>Assigned slot</Label>
                  <Text className="font-sans text-xl font-extrabold text-fg">
                    {selectedSubscription.slotId?.slotCode ?? "No fixed slot"}
                  </Text>
                </View>
                <Text className="font-sans text-sm text-subtle">
                  {selectedSubscription.slotId?.floorId?.floorNumber
                    ? `Floor B${selectedSubscription.slotId.floorId.floorNumber}`
                    : "This plan does not currently include a dedicated slot."}
                </Text>
              </GlassCard>

              <GlassCard className="items-center gap-4">
                <View className="items-center gap-1">
                  <Label>Entry QR</Label>
                  <Text className="font-sans text-xl font-extrabold text-fg">
                    Resident access code
                  </Text>
                </View>

                {selectedSubscription.status !== "active" ? (
                  <View className="items-center gap-2">
                    <Text className="font-sans text-sm font-bold text-fg">
                      QR will appear after activation
                    </Text>
                    <Text className="text-center font-sans text-sm leading-5 text-subtle">
                      Complete payment and confirm the subscription before using resident entry.
                    </Text>
                  </View>
                ) : subscriptionQrMutation.isPending &&
                  qrData?.subscriptionId !== selectedSubscription._id ? (
                  <View className="items-center gap-2 py-10">
                    <Text className="font-sans text-base font-extrabold text-fg">
                      Loading QR...
                    </Text>
                    <Text className="text-center font-sans text-sm text-subtle">
                      Fetching your latest resident access code.
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
                        Refresh QR
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
                      Load QR code
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
