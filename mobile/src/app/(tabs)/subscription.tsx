import { useMemo, useState } from "react";
import { useLocalSearchParams, useRouter } from "expo-router";
import type { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import { toast } from "sonner-native";

import {
  SubscriptionActiveCard,
  SubscriptionGateCard,
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

const normalizeLicensePlate = (value: string) => value.toUpperCase().replace(/\s+/g, "");

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
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(() => routeSelectedPlanId);
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
  const availableVehicles = useMemo(
    () =>
      (currentUser?.vehicles ?? []).filter((vehicle) => vehicle.vehicleType === selectedVehicleType),
    [currentUser?.vehicles, selectedVehicleType],
  );
  const availabilityQuery = useAvailableSubscriptionSlotsQuery(
    selectedVehicleType,
    Boolean(currentUser && selectedPlan),
  );

  const availableCarSlots = useMemo(
    () =>
      flattenAvailableCarSlots(
        availabilityQuery.data?.vehicleType === "car" ? availabilityQuery.data : undefined,
      ),
    [availabilityQuery.data],
  );

  const activeSubscription = useMemo(
    () => mySubscriptionsQuery.data?.subscriptions.find((item) => item.status === "active") ?? null,
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
      toast.error("Thiếu gói đăng ký", {
        description: "Hãy chọn một gói gửi xe trước.",
      });
      return;
    }

    const normalizedPlate = normalizeLicensePlate(licensePlate);
    if (!normalizedPlate) {
      toast.error("Thiếu biển số xe", {
        description: "Nhập biển số xe để liên kết với gói này.",
      });
      return;
    }

    if (selectedPlan.vehicleType === "car" && !resolvedSelectedSlotId) {
      toast.error("Thiếu vị trí đỗ", {
        description: "Hãy chọn một chỗ cư dân còn trống cho gói ô tô.",
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
      toast.success("Tạo gói thành công", {
        description: "Hãy hoàn tất thanh toán để kích hoạt gói gửi xe cư dân.",
      });
    } catch (error) {
      toast.error("Mua gói thất bại", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
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

      toast.success(action === "confirm" ? "Đã đồng bộ gói gửi xe" : "Đã hủy gói gửi xe", {
        description:
          action === "confirm"
            ? "Trạng thái thanh toán đã được cập nhật từ hệ thống."
            : "Gói đang chờ thanh toán đã được hủy.",
      });

      if (action === "confirm") {
        router.push({
          pathname: "/subscription/[subscriptionId]",
          params: {
            subscriptionId: result.subscription._id,
          },
        });
      }
    } catch (error) {
      toast.error("Không thể đồng bộ gói gửi xe", {
        description: error instanceof Error ? error.message : "Vui lòng làm mới lại sau.",
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
        toast.success("Đã làm mới danh sách gói");
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
        eyebrow="Gói cư dân"
        title="Gói gửi xe"
        subtitle="Đăng nhập để mua gói gửi xe cư dân theo tháng hoặc theo quý."
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
      eyebrow="Gói cư dân"
      title="Gói gửi xe"
      subtitle="Chọn gói phù hợp, hoàn tất thanh toán rồi dùng QR đang hoạt động để ra vào."
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
          availableVehicles={availableVehicles}
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
            {purchaseSubscriptionMutation.isPending ? "Đang tạo gói..." : "Mua gói gửi xe"}
          </Text>
        </Pressable>

        {paymentSummary && purchaseResult ? (
          <SubscriptionPaymentCard
            onOpenPayment={setPaymentUrl}
            purchaseResult={purchaseResult}
          />
        ) : null}

        {activeSubscription ? (
          <SubscriptionActiveCard
            onViewDetails={handleOpenSubscriptionDetails}
            subscription={activeSubscription}
          />
        ) : null}
      </ScrollView>

      <SubscriptionPaymentModal
        onClose={() => setPaymentUrl(null)}
        onNavigationStateChange={handlePaymentNavigationChange}
        paymentUrl={paymentUrl}
      />
    </Page>
  );
}
