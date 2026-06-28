import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  cancelSubscription,
  confirmSubscription,
  getAvailableSubscriptionSlots,
  getMySubscriptions,
  getSubscriptionPlans,
  getSubscriptionQr,
  purchaseSubscription,
  subscriptionKeys,
} from "@/lib/subscriptions";

export const useSubscriptionPlansQuery = (enabled: boolean) =>
  useQuery({
    queryKey: subscriptionKeys.plans,
    queryFn: getSubscriptionPlans,
    enabled,
  });

export const useMySubscriptionsQuery = (enabled: boolean) =>
  useQuery({
    queryKey: subscriptionKeys.mine,
    queryFn: () => getMySubscriptions(),
    enabled,
  });

export const useAvailableSubscriptionSlotsQuery = (
  vehicleType: "car" | "motorcycle",
  enabled: boolean,
) =>
  useQuery({
    queryKey: subscriptionKeys.availability(vehicleType),
    queryFn: () => getAvailableSubscriptionSlots(vehicleType),
    enabled,
  });

export const usePurchaseSubscriptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: purchaseSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.mine });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.availability("car") });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.availability("motorcycle") });
    },
  });
};

export const useConfirmSubscriptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.mine });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
    },
  });
};

export const useCancelSubscriptionMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelSubscription,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.mine });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.all });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.availability("car") });
      queryClient.invalidateQueries({ queryKey: subscriptionKeys.availability("motorcycle") });
    },
  });
};

export const useSubscriptionQrMutation = () =>
  useMutation({
    mutationFn: getSubscriptionQr,
  });
