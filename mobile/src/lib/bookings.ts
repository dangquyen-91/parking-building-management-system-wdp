import { apiRequest } from "./api";
import type {
  CreateBookingPayload,
  CreateBookingResult,
  MyBookingsResult,
} from "@/types/bookings";

export const bookingKeys = {
  mine: ["bookings", "mine"] as const,
};

export const createBooking = (payload: CreateBookingPayload) =>
  apiRequest<CreateBookingResult>("/bookings", {
    method: "POST",
    data: payload,
  });

export const getMyBookings = () => apiRequest<MyBookingsResult>("/bookings/me");
