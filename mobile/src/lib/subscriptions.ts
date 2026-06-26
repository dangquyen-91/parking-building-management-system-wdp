import { apiRequest } from "./api";
import type {
  MySubscriptionsResult,
  Plan,
  PurchaseSubscriptionPayload,
  PurchaseSubscriptionResult,
  Subscription,
  SubscriptionAvailabilityResult,
  SubscriptionQrResult,
} from "@/types/subscriptions";

export const subscriptionKeys = {
  all: ["subscriptions"] as const,
  mine: ["subscriptions", "mine"] as const,
  plans: ["subscriptions", "plans"] as const,
  availability: (vehicleType: "car" | "motorcycle") =>
    ["subscriptions", "availability", vehicleType] as const,
};

export const getSubscriptionPlans = () =>
  apiRequest<{ plans: Plan[] }>("/plans", {
    params: {
      isActive: true,
    },
  }).then((result) => result.plans);

export const getMySubscriptions = (status?: string) =>
  apiRequest<MySubscriptionsResult>("/subscriptions/me", {
    params: status ? { status } : undefined,
  });

export const purchaseSubscription = (payload: PurchaseSubscriptionPayload) =>
  apiRequest<PurchaseSubscriptionResult>("/subscriptions", {
    method: "POST",
    data: payload,
  });

export const confirmSubscription = (id: string) =>
  apiRequest<{ subscription: Subscription }>(`/subscriptions/${id}/confirm`, {
    method: "POST",
  });

export const cancelSubscription = (id: string) =>
  apiRequest<{ subscription: Subscription }>(`/subscriptions/${id}/cancel`, {
    method: "PATCH",
  });

export const getSubscriptionQr = (id: string) =>
  apiRequest<SubscriptionQrResult>(`/subscriptions/${id}/qr`);

export const getAvailableSubscriptionSlots = (vehicleType: "car" | "motorcycle") =>
  apiRequest<SubscriptionAvailabilityResult>("/slots/available-for-subscription", {
    params: {
      vehicleType,
    },
  });
