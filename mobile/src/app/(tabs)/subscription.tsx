import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import { toast } from "sonner-native";

import {
  SubscriptionActiveCard,
  SubscriptionGateCard,
  SubscriptionHistorySection,
  SubscriptionPaymentCard,
  SubscriptionPaymentModal,
  SubscriptionPurchaseFormCard,
} from "@/components/subscription";
import { AppRefreshControl } from "@/components/common/refresh-control";
import { Page } from "@/components/parking-ui";
import { useCurrentUserQuery } from "../../hooks/useAuth";
import {
  useAvailableSubscriptionSlotsQuery,
  useCancelSubscriptionMutation,
  useConfirmSubscriptionMutation,
  useMySubscriptionsQuery,
  usePurchaseSubscriptionMutation,
  useSubscriptionPlansQuery,
} from "../../hooks/useSubscriptions";
import type {
  CarSubscriptionAvailabilityResult,
  PurchaseSubscriptionResult,
} from "../../types/subscriptions";
import { Pressable, ScrollView, Text } from "../../tw";

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
  const router = useRouter();
  const params = useLocalSearchParams<{
    licensePlate?: string | string[];
    selectedPlanId?: string | string[];
    selectedSlotId?: string | string[];
  }>();
  const routeSelectedPlanId =
    typeof params.selectedPlanId === "string" ? params.selectedPlanId : null;
  const routeSelectedSlotId =
    typeof params.selectedSlotId === "string" ? params.selectedSlotId : null;
  const routeLicensePlate =
    typeof params.licensePlate === "string" ? params.licensePlate : null;
  const [licensePlate, setLicensePlate] = useState(() => routeLicensePlate ?? "");
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(
    () => routeSelectedPlanId,
  );
  const selectedSlotId = routeSelectedSlotId;
  const [purchaseResult, setPurchaseResult] = useState<PurchaseSubscriptionResult | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: currentUser } = useCurrentUserQuery();
  const plansQuery = useSubscriptionPlansQuery(Boolean(currentUser));
  const mySubscriptionsQuery = useMySubscriptionsQuery(Boolean(currentUser));
  const purchaseSubscriptionMutation = usePurchaseSubscriptionMutation();
  const confirmSubscriptionMutation = useConfirmSubscriptionMutation();
  const cancelSubscriptionMutation = useCancelSubscriptionMutation();

  const selectedPlan = useMemo(() => {
    const plans = plansQuery.data ?? [];

    return (
      plans.find((plan) => plan._id === selectedPlanId) ??
      plans.find((plan) => plan._id === routeSelectedPlanId) ??
      plans[0] ??
      null
    );
  }, [plansQuery.data, routeSelectedPlanId, selectedPlanId]);

  const resolvedSelectedPlanId = selectedPlan?._id ?? null;
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
    () =>
      mySubscriptionsQuery.data?.subscriptions.find((item) => item.status === "active") ??
      null,
    [mySubscriptionsQuery.data?.subscriptions],
  );
  const resolvedSelectedSlotId = useMemo(() => {
    if (selectedPlan?.vehicleType !== "car") {
      return null;
    }

    return (
      availableCarSlots.find(({ slot }) => slot._id === selectedSlotId)?.slot._id ??
      availableCarSlots.find(({ slot }) => slot._id === routeSelectedSlotId)?.slot._id ??
      availableCarSlots[0]?.slot._id ??
      null
    );
  }, [availableCarSlots, routeSelectedSlotId, selectedPlan?.vehicleType, selectedSlotId]);

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

    if (selectedPlan.vehicleType === "car" && !resolvedSelectedSlotId) {
      toast.error("Slot required", {
        description: "Choose an available resident slot for the car subscription.",
      });
      return;
    }

    try {
      const result = await purchaseSubscriptionMutation.mutateAsync({
        planId: selectedPlan._id,
        licensePlate: normalizedPlate,
        slotId:
          selectedPlan.vehicleType === "car" ? resolvedSelectedSlotId ?? undefined : undefined,
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

      setPaymentUrl(null);
      setPurchaseResult(null);

      toast.success(
        action === "confirm" ? "Subscription synced" : "Subscription cancelled",
        {
          description:
            action === "confirm"
              ? "The payment status has been refreshed from the server."
              : "The pending subscription has been cancelled.",
        },
      );

      if (action === "confirm") {
        router.push({
          pathname: "/subscription/[subscriptionId]",
          params: {
            subscriptionId: result.subscription._id,
          },
        });
      }
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

  const handleRefreshSubscriptions = async () => {
    setIsRefreshing(true);

    try {
      const results = await Promise.all([
        plansQuery.refetch(),
        mySubscriptionsQuery.refetch(),
        ...(selectedPlan ? [availabilityQuery.refetch()] : []),
      ]);

      if (results.every((result) => result.isSuccess)) {
        toast.success("Subscriptions refreshed");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleOpenSlotPicker = () => {
    if (!selectedPlan || selectedPlan.vehicleType !== "car") {
      return;
    }

    router.push({
      pathname: "/resident-slot-picker",
      params: {
        licensePlate,
        selectedPlanId: selectedPlan._id,
        selectedSlotId: resolvedSelectedSlotId ?? undefined,
      },
    });
  };

  const paymentSummary = purchaseResult?.payment;
  const handleOpenSubscriptionDetails = (subscriptionId?: string) => {
    if (!subscriptionId) {
      return;
    }

    router.push({
      pathname: "/subscription/[subscriptionId]",
      params: { subscriptionId },
    });
  };

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
          refreshControl={
            <AppRefreshControl
              onRefresh={handleRefreshSubscriptions}
              refreshing={isRefreshing}
            />
          }
        >
          <SubscriptionGateCard />
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
        refreshControl={
          <AppRefreshControl
            onRefresh={handleRefreshSubscriptions}
            refreshing={isRefreshing}
          />
        }
      >
        <SubscriptionPurchaseFormCard
          availableCarSlots={availableCarSlots}
          availabilityLoading={availabilityQuery.isFetching}
          licensePlate={licensePlate}
          motorcycleAvailability={
            availabilityQuery.data?.vehicleType === "motorcycle"
              ? availabilityQuery.data
              : undefined
          }
          onChangeLicensePlate={setLicensePlate}
          onOpenSlotPicker={handleOpenSlotPicker}
          onSelectPlan={setSelectedPlanId}
          plans={plansQuery.data ?? []}
          plansLoading={plansQuery.isLoading}
          selectedPlan={selectedPlan}
          selectedPlanId={resolvedSelectedPlanId}
          selectedSlotId={resolvedSelectedSlotId}
        />

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

        {paymentSummary && purchaseResult ? (
          <SubscriptionPaymentCard
            confirmPending={confirmSubscriptionMutation.isPending}
            onOpenPayment={setPaymentUrl}
            onSyncStatus={() => handlePaymentStateSync("confirm")}
            purchaseResult={purchaseResult}
          />
        ) : null}

        {activeSubscription ? (
          <SubscriptionActiveCard
            onViewDetails={handleOpenSubscriptionDetails}
            subscription={activeSubscription}
          />
        ) : null}

        <SubscriptionHistorySection
          cancelPending={cancelSubscriptionMutation.isPending}
          confirmPending={confirmSubscriptionMutation.isPending}
          isFetching={mySubscriptionsQuery.isFetching}
          onCancel={(subscriptionId) => {
            cancelSubscriptionMutation
              .mutateAsync(subscriptionId)
              .then(() => {
                toast.success("Subscription cancelled");
              })
              .catch((error: unknown) => {
                toast.error("Cancel failed", {
                  description:
                    error instanceof Error ? error.message : "Please try again later.",
                });
              });
          }}
          onConfirm={(subscriptionId) => {
            confirmSubscriptionMutation
              .mutateAsync(subscriptionId)
              .then((result) => {
                toast.success("Subscription synced");
                handleOpenSubscriptionDetails(result.subscription._id);
              })
              .catch((error: unknown) => {
                toast.error("Sync failed", {
                  description:
                    error instanceof Error ? error.message : "Please try again later.",
                });
              });
          }}
          onViewDetails={handleOpenSubscriptionDetails}
          subscriptions={mySubscriptionsQuery.data?.subscriptions ?? []}
        />
      </ScrollView>

      <SubscriptionPaymentModal
        onClose={() => setPaymentUrl(null)}
        onNavigationStateChange={handlePaymentNavigationChange}
        paymentUrl={paymentUrl}
      />
    </Page>
  );
}
