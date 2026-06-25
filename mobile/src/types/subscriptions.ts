export type SubscriptionVehicleType = "car" | "motorcycle";

export type Plan = {
  _id: string;
  code: string;
  name: string;
  vehicleType: SubscriptionVehicleType;
  durationDays: number;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SubscriptionUser = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
};

export type SubscriptionBuilding = {
  _id: string;
  name?: string;
  address?: string;
  isActive?: boolean;
};

export type SubscriptionFloor = {
  _id: string;
  floorNumber: number;
  building?: SubscriptionBuilding;
  buildingId?: SubscriptionBuilding;
  floorType?: string;
  totalSlots?: number;
  description?: string;
};

export type SubscriptionSlot = {
  _id: string;
  slotCode: string;
  status?: "empty" | "occupied" | "reserved" | "maintenance";
  vehicleType?: SubscriptionVehicleType;
  floorId?: SubscriptionFloor;
  available?: boolean;
};

export type SubscriptionStatus = "pending" | "active" | "expired" | "cancelled";

export type Subscription = {
  _id: string;
  userId?: string | SubscriptionUser;
  planId: Plan;
  licensePlate: string;
  vehicleType: SubscriptionVehicleType;
  slotId?: SubscriptionSlot | null;
  startDate?: string | null;
  endDate?: string | null;
  status: SubscriptionStatus;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type SubscriptionPayment = {
  orderCode: number;
  amount: number;
  checkoutUrl: string;
  paymentLinkId: string;
  qrCode?: string;
  accountNumber?: string;
  accountName?: string;
  bin?: string;
};

export type PurchaseSubscriptionPayload = {
  planId: string;
  licensePlate: string;
  slotId?: string;
};

export type PurchaseSubscriptionResult = {
  subscription: Subscription;
  payment: SubscriptionPayment;
};

export type MySubscriptionsResult = {
  subscriptions: Subscription[];
};

export type SubscriptionQrResult = {
  qrToken: string;
  qrImage: string;
  licensePlate: string;
  subscriptionId: string;
};

export type CarSubscriptionSlotAvailability = {
  _id: string;
  slotCode: string;
  status: "empty" | "occupied" | "reserved" | "maintenance";
  available: boolean;
};

export type CarSubscriptionFloorAvailability = {
  floor: {
    _id: string;
    floorNumber: number;
    description?: string;
    totalSlots: number;
    building?: SubscriptionBuilding;
  };
  slots: CarSubscriptionSlotAvailability[];
  availableCount: number;
};

export type CarSubscriptionAvailabilityResult = {
  vehicleType: "car";
  floors: CarSubscriptionFloorAvailability[];
};

export type MotorcycleSubscriptionAvailabilityResult = {
  vehicleType: "motorcycle";
  floors: Array<{
    _id: string;
    floorNumber: number;
    description?: string;
    totalSlots: number;
    building?: SubscriptionBuilding;
  }>;
  totalCapacity: number;
  soldCount: number;
  availableCount: number;
  note?: string;
};

export type SubscriptionAvailabilityResult =
  | CarSubscriptionAvailabilityResult
  | MotorcycleSubscriptionAvailabilityResult;

export const isCarSubscriptionAvailabilityResult = (
  value: SubscriptionAvailabilityResult | undefined,
): value is CarSubscriptionAvailabilityResult => value?.vehicleType === "car";
