import { useEffect, useMemo, useState } from "react";
import type { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import { toast } from "sonner-native";

import {
  SubscriptionActiveCard,
  SubscriptionGateCard,
  SubscriptionHistorySection,
  SubscriptionPaymentCard,
  SubscriptionPaymentModal,
  SubscriptionPurchaseFormCard,
  SubscriptionQrModal,
} from "@/components/subscription";
import { Page } from "@/components/parking-ui";
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
    () =>
      mySubscriptionsQuery.data?.subscriptions.find((item) => item.status === "active") ??
      null,
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
  const isLoadingActiveQr =
    subscriptionQrMutation.isPending && selectedQrSubscriptionId === activeSubscription?._id;

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
          onSelectPlan={setSelectedPlanId}
          onSelectSlot={setSelectedSlotId}
          plans={plansQuery.data ?? []}
          plansLoading={plansQuery.isLoading}
          selectedPlan={selectedPlan}
          selectedPlanId={selectedPlanId}
          selectedSlotId={selectedSlotId}
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
            isLoadingQr={Boolean(isLoadingActiveQr)}
            onOpenQr={handleOpenQr}
            subscription={activeSubscription}
          />
        ) : null}

        <SubscriptionHistorySection
          cancelPending={cancelSubscriptionMutation.isPending}
          confirmPending={confirmSubscriptionMutation.isPending}
          isFetching={mySubscriptionsQuery.isFetching}
          isLoadingQrForId={
            subscriptionQrMutation.isPending ? selectedQrSubscriptionId : null
          }
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
              .then(() => {
                toast.success("Subscription synced");
              })
              .catch((error: unknown) => {
                toast.error("Sync failed", {
                  description:
                    error instanceof Error ? error.message : "Please try again later.",
                });
              });
          }}
          onOpenQr={handleOpenQr}
          onRefresh={handleRefreshSubscriptions}
          subscriptions={mySubscriptionsQuery.data?.subscriptions ?? []}
        />
      </ScrollView>

      <SubscriptionPaymentModal
        onClose={() => setPaymentUrl(null)}
        onNavigationStateChange={handlePaymentNavigationChange}
        paymentUrl={paymentUrl}
      />

      <SubscriptionQrModal
        onClose={handleCloseQr}
        qrData={subscriptionQrMutation.data}
        visible={qrModalVisible}
      />
    </Page>
  );
}
