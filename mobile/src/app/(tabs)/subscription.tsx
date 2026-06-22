import { Image } from "expo-image";
import { useEffect, useMemo, useState } from "react";
import { Linking, Modal } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { WebView } from "react-native-webview";
import type { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import { toast } from "sonner-native";

import { GlassCard, Label, Page } from "../../components/parking-ui";
import { useCurrentUserQuery } from "../../hooks/useAuth";
import {
  useAvailableSubscriptionSlotsQuery,
  useCancelSubscriptionMutation,
  useConfirmSubscriptionMutation,
  useMySubscriptionsQuery,
  usePurchaseSubscriptionMutation,
  useSubscriptionPlansQuery,
  useSubscriptionQrMutation,
} from "../../hooks/useSubscriptions";
import type {
  CarSubscriptionAvailabilityResult,
  Plan,
  PurchaseSubscriptionResult,
  Subscription,
} from "../../types/subscriptions";
import { Link, Pressable, ScrollView, Text, TextInput, View } from "../../tw";

const formatMoney = (value: number) => `${value.toLocaleString("vi-VN")} VND`;

const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Not started";

const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString("vi-VN", {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Not available";

const formatVehicleType = (value: Plan["vehicleType"]) =>
  value === "car" ? "Car" : "Motorcycle";

const getSubscriptionTone = (status: Subscription["status"]) => {
  if (status === "active") {
    return "text-btn-primary";
  }

  if (status === "expired" || status === "cancelled") {
    return "text-faint";
  }

  return "text-fg";
};

const normalizeLicensePlate = (value: string) =>
  value.toUpperCase().replace(/\s+/g, "");

const flattenAvailableCarSlots = (data?: CarSubscriptionAvailabilityResult) =>
  (data?.floors ?? []).flatMap((entry) =>
    entry.slots
      .filter((slot) => slot.available)
      .map((slot) => ({
        floor: entry.floor,
        slot,
      })),
  );

export default function SubscriptionScreen() {
  const [licensePlate, setLicensePlate] = useState("");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
  const [purchaseResult, setPurchaseResult] = useState<PurchaseSubscriptionResult | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [selectedQrSubscriptionId, setSelectedQrSubscriptionId] = useState<string | null>(null);

  const { data: currentUser } = useCurrentUserQuery();
  const plansQuery = useSubscriptionPlansQuery(Boolean(currentUser));
  const mySubscriptionsQuery = useMySubscriptionsQuery(Boolean(currentUser));
  const purchaseSubscriptionMutation = usePurchaseSubscriptionMutation();
  const confirmSubscriptionMutation = useConfirmSubscriptionMutation();
  const cancelSubscriptionMutation = useCancelSubscriptionMutation();
  const subscriptionQrMutation = useSubscriptionQrMutation();

  const selectedPlan = useMemo(
    () => plansQuery.data?.find((plan) => plan._id === selectedPlanId) ?? null,
    [plansQuery.data, selectedPlanId],
  );

  const selectedVehicleType = selectedPlan?.vehicleType ?? "car";
  const availabilityQuery = useAvailableSubscriptionSlotsQuery(
    selectedVehicleType,
    Boolean(currentUser && selectedPlan),
  );

  const availableCarSlots = useMemo(
    () =>
      flattenAvailableCarSlots(
        availabilityQuery.data?.vehicleType === "car"
          ? availabilityQuery.data
          : undefined,
      ),
    [availabilityQuery.data],
  );

  const activeSubscription = useMemo(
    () => mySubscriptionsQuery.data?.subscriptions.find((item) => item.status === "active") ?? null,
    [mySubscriptionsQuery.data?.subscriptions],
  );

  useEffect(() => {
    if (!plansQuery.data?.length) {
      return;
    }

    if (!selectedPlanId || !plansQuery.data.some((plan) => plan._id === selectedPlanId)) {
      setSelectedPlanId(plansQuery.data[0]._id);
    }
  }, [plansQuery.data, selectedPlanId]);

  useEffect(() => {
    if (selectedPlan?.vehicleType !== "car") {
      setSelectedSlotId(null);
      return;
    }

    if (!availableCarSlots.some(({ slot }) => slot._id === selectedSlotId)) {
      setSelectedSlotId(availableCarSlots[0]?.slot._id ?? null);
    }
  }, [availableCarSlots, selectedPlan?.vehicleType, selectedSlotId]);

  const handlePurchase = async () => {
    if (!selectedPlan) {
      toast.error("Plan missing", {
        description: "Choose a subscription plan first.",
      });
      return;
    }

    const normalizedPlate = normalizeLicensePlate(licensePlate);
    if (!normalizedPlate) {
      toast.error("License plate required", {
        description: "Enter the vehicle plate to bind this subscription.",
      });
      return;
    }

    if (selectedPlan.vehicleType === "car" && !selectedSlotId) {
      toast.error("Slot required", {
        description: "Choose an available resident slot for the car subscription.",
      });
      return;
    }

    try {
      const result = await purchaseSubscriptionMutation.mutateAsync({
        planId: selectedPlan._id,
        licensePlate: normalizedPlate,
        slotId: selectedPlan.vehicleType === "car" ? selectedSlotId ?? undefined : undefined,
      });

      setPurchaseResult(result);
      setPaymentUrl(result.payment.checkoutUrl);
      toast.success("Subscription created", {
        description: "Complete payment to activate your resident subscription.",
      });
    } catch (error) {
      toast.error("Purchase failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const handlePaymentStateSync = async (action: "confirm" | "cancel") => {
    if (!purchaseResult) {
      return;
    }

    try {
      const result =
        action === "confirm"
          ? await confirmSubscriptionMutation.mutateAsync(purchaseResult.subscription._id)
          : await cancelSubscriptionMutation.mutateAsync(purchaseResult.subscription._id);

      setPurchaseResult((current) =>
        current
          ? {
              ...current,
              subscription: result.subscription,
            }
          : current,
      );
      setPaymentUrl(null);

      toast.success(
        action === "confirm" ? "Subscription synced" : "Subscription cancelled",
        {
          description:
            action === "confirm"
              ? "The payment status has been refreshed from the server."
              : "The pending subscription has been cancelled.",
        },
      );
    } catch (error) {
      toast.error("Unable to sync subscription", {
        description: error instanceof Error ? error.message : "Please refresh later.",
      });
    }
  };

  const handlePaymentNavigationChange = ({ url }: WebViewNavigation) => {
    const normalizedUrl = url.toLowerCase();

    if (normalizedUrl.includes("/payment/success")) {
      void handlePaymentStateSync("confirm");
      return;
    }

    if (normalizedUrl.includes("/payment/cancel")) {
      void handlePaymentStateSync("cancel");
    }
  };

  const handleOpenQr = async (subscriptionId: string) => {
    try {
      setSelectedQrSubscriptionId(subscriptionId);
      const result = await subscriptionQrMutation.mutateAsync(subscriptionId);
      setQrModalVisible(true);
      toast.success("QR loaded", {
        description: `Entry QR ready for ${result.licensePlate}.`,
      });
    } catch (error) {
      setSelectedQrSubscriptionId(null);
      toast.error("Cannot load QR", {
        description: error instanceof Error ? error.message : "Please try again later.",
      });
    }
  };

  const handleCloseQr = () => {
    setQrModalVisible(false);
    setSelectedQrSubscriptionId(null);
    subscriptionQrMutation.reset();
  };

  const handleRefreshSubscriptions = async () => {
    const result = await mySubscriptionsQuery.refetch();

    if (result.isSuccess) {
      toast.success("Subscriptions refreshed");
    }
  };

  const paymentSummary = purchaseResult?.payment;

  if (!currentUser) {
    return (
      <Page
        eyebrow="Resident plans"
        title="Subscriptions"
        subtitle="Sign in to buy monthly or quarterly resident parking plans."
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-4 px-5 pb-[120px]"
        >
          <GlassCard className="gap-4">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-badge">
              <Ionicons name="lock-closed" color="#ffffff" size={22} />
            </View>
            <View className="gap-1">
              <Text className="font-sans text-xl font-extrabold text-fg">
                Sign in required
              </Text>
              <Text className="font-sans text-sm leading-5 text-subtle">
                Resident subscriptions are attached to your account and vehicle plate.
              </Text>
            </View>
            <Link href="/(auth)/login" asChild>
              <Pressable className="items-center rounded-full bg-btn-primary py-4">
                <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                  Sign in
                </Text>
              </Pressable>
            </Link>
          </GlassCard>
        </ScrollView>
      </Page>
    );
  }

  return (
    <Page
      eyebrow="Resident plans"
      title="Subscriptions"
      subtitle="Choose a monthly plan, complete payment, then use your active QR for resident entry."
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-5 pb-[120px]"
      >
        <GlassCard className="gap-4">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-btn-primary">
              <Ionicons name="card" color="#000000" size={22} />
            </View>
            <View className="flex-1 gap-1">
              <Text className="font-sans text-lg font-extrabold text-fg">
                Buy a resident plan
              </Text>
              <Text className="font-sans text-sm leading-5 text-subtle">
                Car plans reserve a fixed resident slot. Motorcycle plans share resident capacity.
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <View className="gap-2">
              <Label>License plate</Label>
              <TextInput
                autoCapitalize="characters"
                onChangeText={setLicensePlate}
                placeholder="59-AB24872"
                placeholderTextColor="#6b7280"
                value={licensePlate}
                className="rounded-[14px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
              />
            </View>

            <View className="gap-2">
              <Label>Choose plan</Label>
              {plansQuery.isLoading ? (
                <GlassCard className="gap-1">
                  <Text className="font-sans text-base font-extrabold text-fg">
                    Loading plans...
                  </Text>
                </GlassCard>
              ) : (
                <View className="gap-2">
                  {(plansQuery.data ?? []).map((plan) => {
                    const isSelected = plan._id === selectedPlanId;

                    return (
                      <Pressable
                        key={plan._id}
                        className={`rounded-[18px] border px-4 py-4 ${
                          isSelected
                            ? "border-btn-primary bg-btn-primary"
                            : "border-border-theme bg-glass-card"
                        }`}
                        onPress={() => setSelectedPlanId(plan._id)}
                      >
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1 gap-1">
                            <Text
                              className={`font-sans text-base font-extrabold ${
                                isSelected ? "text-btn-primary-fg" : "text-fg"
                              }`}
                            >
                              {plan.name}
                            </Text>
                            <Text
                              className={`font-sans text-sm ${
                                isSelected ? "text-btn-primary-fg" : "text-subtle"
                              }`}
                            >
                              {formatVehicleType(plan.vehicleType)} · {plan.durationDays} days
                            </Text>
                            {plan.description ? (
                              <Text
                                className={`font-sans text-sm leading-5 ${
                                  isSelected ? "text-btn-primary-fg" : "text-subtle"
                                }`}
                              >
                                {plan.description}
                              </Text>
                            ) : null}
                          </View>
                          <Text
                            className={`font-sans text-sm font-extrabold ${
                              isSelected ? "text-btn-primary-fg" : "text-fg"
                            }`}
                          >
                            {formatMoney(plan.price)}
                          </Text>
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </View>

            {selectedPlan?.vehicleType === "car" ? (
              <View className="gap-2">
                <View className="flex-row items-center justify-between gap-3">
                  <Label>Resident car slot</Label>
                  {availabilityQuery.isFetching ? (
                    <Text className="font-sans text-xs font-bold text-subtle">Loading</Text>
                  ) : null}
                </View>

                {availableCarSlots.length > 0 ? (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerClassName="gap-2 pr-1"
                  >
                    {availableCarSlots.map(({ floor, slot }) => {
                      const isSelected = slot._id === selectedSlotId;
                      const buildingName =
                        floor.building?.name ?? floor.building?.address ?? "Resident building";

                      return (
                        <Pressable
                          key={slot._id}
                          className={`min-w-[170px] rounded-[18px] border px-4 py-4 ${
                            isSelected
                              ? "border-btn-primary bg-btn-primary"
                              : "border-border-theme bg-glass-card"
                          }`}
                          onPress={() => setSelectedSlotId(slot._id)}
                        >
                          <Text
                            className={`font-sans text-base font-extrabold ${
                              isSelected ? "text-btn-primary-fg" : "text-fg"
                            }`}
                          >
                            {slot.slotCode}
                          </Text>
                          <Text
                            className={`font-sans text-sm ${
                              isSelected ? "text-btn-primary-fg" : "text-subtle"
                            }`}
                          >
                            Floor B{floor.floorNumber}
                          </Text>
                          <Text
                            className={`font-sans text-xs leading-5 ${
                              isSelected ? "text-btn-primary-fg" : "text-subtle"
                            }`}
                          >
                            {buildingName}
                          </Text>
                        </Pressable>
                      );
                    })}
                  </ScrollView>
                ) : (
                  <GlassCard className="gap-1">
                    <Text className="font-sans text-base font-extrabold text-fg">
                      No resident car slots available
                    </Text>
                    <Text className="font-sans text-sm leading-5 text-subtle">
                      Try again later or choose another plan after a slot becomes free.
                    </Text>
                  </GlassCard>
                )}
              </View>
            ) : selectedPlan?.vehicleType === "motorcycle" ? (
              <GlassCard className="gap-2">
                <Label>Resident motorcycle capacity</Label>
                <Text className="font-sans text-xl font-extrabold text-fg">
                  {availabilityQuery.data?.vehicleType === "motorcycle"
                    ? `${availabilityQuery.data.availableCount} spots left`
                    : "Checking capacity..."}
                </Text>
                {availabilityQuery.data?.vehicleType === "motorcycle" ? (
                  <Text className="font-sans text-sm leading-5 text-subtle">
                    {availabilityQuery.data.soldCount}/{availabilityQuery.data.totalCapacity} sold.
                    {availabilityQuery.data.note ? ` ${availabilityQuery.data.note}` : ""}
                  </Text>
                ) : null}
              </GlassCard>
            ) : null}
          </View>
        </GlassCard>

        <Pressable
          className="items-center rounded-full bg-btn-primary py-4"
          disabled={purchaseSubscriptionMutation.isPending || !selectedPlan}
          onPress={handlePurchase}
        >
          <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
            {purchaseSubscriptionMutation.isPending
              ? "Creating subscription..."
              : "Buy subscription"}
          </Text>
        </Pressable>

        {paymentSummary ? (
          <GlassCard className="gap-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-1">
                <Label>Payment pending</Label>
                <Text className="font-sans text-xl font-extrabold text-fg">
                  {formatMoney(paymentSummary.amount)}
                </Text>
                <Text className="font-sans text-sm text-subtle">
                  Order #{paymentSummary.orderCode}
                </Text>
              </View>
              <Text
                className={`rounded-full bg-badge px-3 py-1 font-sans text-xs font-bold uppercase ${getSubscriptionTone(
                  purchaseResult?.subscription.status ?? "pending",
                )}`}
              >
                {purchaseResult?.subscription.status ?? "pending"}
              </Text>
            </View>

            <View className="gap-2 rounded-[14px] bg-surface-alt p-3">
              <Text selectable className="font-sans text-base font-extrabold text-fg">
                {purchaseResult?.subscription.licensePlate}
              </Text>
              <Text className="font-sans text-sm text-subtle">
                {purchaseResult?.subscription.planId.name}
              </Text>
            </View>

            <View className="flex-row gap-3">
              <Pressable
                className="flex-1 items-center rounded-full bg-btn-primary py-3.5"
                onPress={() => setPaymentUrl(paymentSummary.checkoutUrl)}
              >
                <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                  Open payment
                </Text>
              </Pressable>
              <Pressable
                className="flex-1 items-center rounded-full border border-border-strong bg-badge py-3.5"
                disabled={confirmSubscriptionMutation.isPending}
                onPress={() => handlePaymentStateSync("confirm")}
              >
                <Text className="font-sans text-base font-extrabold text-fg">
                  Sync status
                </Text>
              </Pressable>
            </View>
          </GlassCard>
        ) : null}

        {activeSubscription ? (
          <GlassCard className="gap-4">
            <View className="flex-row items-center justify-between gap-3">
              <View className="gap-1">
                <Label>Active subscription</Label>
                <Text className="font-sans text-xl font-extrabold text-fg">
                  {activeSubscription.planId.name}
                </Text>
              </View>
              <Text className="font-sans text-xs font-extrabold uppercase text-btn-primary">
                {activeSubscription.status}
              </Text>
            </View>

            <View className="gap-2 rounded-[14px] bg-surface-alt p-3">
              <Text selectable className="font-sans text-base font-extrabold text-fg">
                {activeSubscription.licensePlate}
              </Text>
              <Text className="font-sans text-sm text-subtle">
                Valid until {formatDate(activeSubscription.endDate)}
              </Text>
              {activeSubscription.slotId?.slotCode ? (
                <Text className="font-sans text-sm text-subtle">
                  Reserved slot: {activeSubscription.slotId.slotCode}
                </Text>
              ) : null}
            </View>

            <Pressable
              className="items-center rounded-full bg-btn-primary py-3.5"
              disabled={
                subscriptionQrMutation.isPending &&
                selectedQrSubscriptionId === activeSubscription._id
              }
              onPress={() => handleOpenQr(activeSubscription._id)}
            >
              <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                {subscriptionQrMutation.isPending &&
                selectedQrSubscriptionId === activeSubscription._id
                  ? "Loading QR..."
                  : "View entry QR"}
              </Text>
            </Pressable>
          </GlassCard>
        ) : null}

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
              disabled={mySubscriptionsQuery.isFetching}
              onPress={handleRefreshSubscriptions}
            >
              <Text className="font-sans text-sm font-bold text-fg">
                {mySubscriptionsQuery.isFetching ? "Refreshing..." : "Refresh"}
              </Text>
            </Pressable>
          </View>

          {(mySubscriptionsQuery.data?.subscriptions ?? []).map((subscription) => (
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
                  {formatVehicleType(subscription.vehicleType)} · {formatMoney(subscription.planId.price)}
                </Text>
                <Text className="font-sans text-sm text-subtle">
                  Created: {formatDateTime(subscription.createdAt)}
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
                    disabled={confirmSubscriptionMutation.isPending}
                    onPress={() =>
                      confirmSubscriptionMutation
                        .mutateAsync(subscription._id)
                        .then(() => {
                          toast.success("Subscription synced");
                        })
                        .catch((error: unknown) => {
                          toast.error("Sync failed", {
                            description:
                              error instanceof Error ? error.message : "Please try again later.",
                          });
                        })
                    }
                  >
                    <Text className="font-sans text-sm font-extrabold text-btn-primary-fg">
                      Confirm payment
                    </Text>
                  </Pressable>
                  <Pressable
                    className="flex-1 items-center rounded-full border border-border-strong bg-badge py-3"
                    disabled={cancelSubscriptionMutation.isPending}
                    onPress={() =>
                      cancelSubscriptionMutation
                        .mutateAsync(subscription._id)
                        .then(() => {
                          toast.success("Subscription cancelled");
                        })
                        .catch((error: unknown) => {
                          toast.error("Cancel failed", {
                            description:
                              error instanceof Error ? error.message : "Please try again later.",
                          });
                        })
                    }
                  >
                    <Text className="font-sans text-sm font-extrabold text-fg">
                      Cancel
                    </Text>
                  </Pressable>
                </View>
              ) : subscription.status === "active" ? (
                <Pressable
                  className="items-center rounded-full border border-border-strong bg-badge py-3"
                  disabled={
                    subscriptionQrMutation.isPending &&
                    selectedQrSubscriptionId === subscription._id
                  }
                  onPress={() => handleOpenQr(subscription._id)}
                >
                  <Text className="font-sans text-sm font-extrabold text-fg">
                    Open QR
                  </Text>
                </Pressable>
              ) : null}
            </GlassCard>
          ))}

          {!mySubscriptionsQuery.isFetching &&
          (mySubscriptionsQuery.data?.subscriptions?.length ?? 0) === 0 ? (
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
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setPaymentUrl(null)}
        presentationStyle="fullScreen"
        visible={Boolean(paymentUrl)}
      >
        <View className="flex-1 bg-page">
          <View className="flex-row items-center justify-between border-b border-border-theme bg-glass-card px-4 pb-3 pt-14">
            <Pressable
              className="h-10 w-10 items-center justify-center rounded-full bg-badge"
              onPress={() => setPaymentUrl(null)}
            >
              <Ionicons name="close" color="#ffffff" size={22} />
            </Pressable>

            <Text className="font-sans text-base font-extrabold text-fg">
              PayOS payment
            </Text>

            <Pressable
              className="h-10 w-10 items-center justify-center rounded-full bg-badge"
              onPress={() => {
                if (paymentUrl) {
                  void Linking.openURL(paymentUrl);
                }
              }}
            >
              <Ionicons name="open-outline" color="#ffffff" size={20} />
            </Pressable>
          </View>

          {paymentUrl ? (
            <WebView
              className="flex-1"
              onNavigationStateChange={handlePaymentNavigationChange}
              source={{ uri: paymentUrl }}
              startInLoadingState
            />
          ) : null}
        </View>
      </Modal>

      <Modal
        animationType="slide"
        onRequestClose={handleCloseQr}
        transparent
        visible={qrModalVisible}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="gap-4 rounded-t-[28px] bg-page px-5 pb-8 pt-5">
            <View className="flex-row items-center justify-between">
              <Text className="font-sans text-lg font-extrabold text-fg">
                Resident entry QR
              </Text>
              <Pressable
                className="rounded-full bg-badge px-4 py-2"
                onPress={handleCloseQr}
              >
                <Text className="font-sans text-sm font-bold text-fg">Done</Text>
              </Pressable>
            </View>

            {subscriptionQrMutation.data ? (
              <GlassCard className="items-center gap-3">
                <Image
                  contentFit="contain"
                  source={{ uri: subscriptionQrMutation.data.qrImage }}
                  style={{ width: 260, height: 260 }}
                />
                <Text className="font-sans text-lg font-extrabold text-fg">
                  {subscriptionQrMutation.data.licensePlate}
                </Text>
                <Text selectable className="font-sans text-xs text-subtle">
                  {subscriptionQrMutation.data.qrToken}
                </Text>
              </GlassCard>
            ) : null}
          </View>
        </View>
      </Modal>
    </Page>
  );
}
