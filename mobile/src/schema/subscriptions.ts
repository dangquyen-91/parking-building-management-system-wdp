import { z } from "zod";

export const subscriptionVehicleTypeSchema = z.enum(["car", "motorcycle"]);

export const planSchema = z.object({
  _id: z.string().min(1),
  code: z.string().min(1),
  name: z.string().min(1),
  vehicleType: subscriptionVehicleTypeSchema,
  durationDays: z.number(),
  price: z.number(),
  description: z.string().optional(),
  isActive: z.boolean(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
});

export const subscriptionUserSchema = z.object({
  _id: z.string().min(1),
  fullName: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
});

export const subscriptionBuildingSchema = z.object({
  _id: z.string().min(1),
  name: z.string().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
});

export const subscriptionFloorSchema = z.object({
  _id: z.string().min(1),
  floorNumber: z.number(),
  building: subscriptionBuildingSchema.optional(),
  buildingId: subscriptionBuildingSchema.optional(),
  floorType: z.string().optional(),
  totalSlots: z.number().optional(),
  description: z.string().optional(),
});

export const subscriptionSlotSchema = z.object({
  _id: z.string().min(1),
  slotCode: z.string().min(1),
  status: z.enum(["empty", "occupied", "reserved", "maintenance"]).optional(),
  vehicleType: subscriptionVehicleTypeSchema.optional(),
  floorId: subscriptionFloorSchema.optional(),
  available: z.boolean().optional(),
});

export const subscriptionStatusSchema = z.enum([
  "pending",
  "active",
  "expired",
  "cancelled",
]);

export const subscriptionSchema = z.object({
  _id: z.string().min(1),
  userId: z.union([z.string().min(1), subscriptionUserSchema]).optional(),
  planId: planSchema,
  licensePlate: z.string().min(1),
  vehicleType: subscriptionVehicleTypeSchema,
  slotId: subscriptionSlotSchema.nullable().optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  status: subscriptionStatusSchema,
  note: z.string().optional(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

export const subscriptionPaymentSchema = z.object({
  orderCode: z.number(),
  amount: z.number(),
  checkoutUrl: z.url(),
  paymentLinkId: z.string().min(1),
  qrCode: z.string().optional(),
  accountNumber: z.string().optional(),
  accountName: z.string().optional(),
  bin: z.string().optional(),
});

export const purchaseSubscriptionPayloadSchema = z.object({
  planId: z.string().min(1, "Plan is required."),
  licensePlate: z.string().trim().min(1, "License plate is required."),
  slotId: z.string().min(1).optional(),
});

export const purchaseSubscriptionResultSchema = z.object({
  subscription: subscriptionSchema,
  payment: subscriptionPaymentSchema,
});

export const mySubscriptionsResultSchema = z.object({
  subscriptions: z.array(subscriptionSchema),
});

export const subscriptionQrResultSchema = z.object({
  qrToken: z.string().min(1),
  qrImage: z.url(),
  licensePlate: z.string().min(1),
  subscriptionId: z.string().min(1),
});

export const carSubscriptionSlotAvailabilitySchema = z.object({
  _id: z.string().min(1),
  slotCode: z.string().min(1),
  status: z.enum(["empty", "occupied", "reserved", "maintenance"]),
  available: z.boolean(),
});

export const carSubscriptionFloorAvailabilitySchema = z.object({
  floor: z.object({
    _id: z.string().min(1),
    floorNumber: z.number(),
    description: z.string().optional(),
    totalSlots: z.number(),
    building: subscriptionBuildingSchema.optional(),
  }),
  slots: z.array(carSubscriptionSlotAvailabilitySchema),
  availableCount: z.number(),
});

export const carSubscriptionAvailabilityResultSchema = z.object({
  vehicleType: z.literal("car"),
  floors: z.array(carSubscriptionFloorAvailabilitySchema),
});

export const motorcycleSubscriptionAvailabilityResultSchema = z.object({
  vehicleType: z.literal("motorcycle"),
  floors: z.array(
    z.object({
      _id: z.string().min(1),
      floorNumber: z.number(),
      description: z.string().optional(),
      totalSlots: z.number(),
      building: subscriptionBuildingSchema.optional(),
    }),
  ),
  totalCapacity: z.number(),
  soldCount: z.number(),
  availableCount: z.number(),
  note: z.string().optional(),
});

export const subscriptionAvailabilityResultSchema = z.union([
  carSubscriptionAvailabilityResultSchema,
  motorcycleSubscriptionAvailabilityResultSchema,
]);
