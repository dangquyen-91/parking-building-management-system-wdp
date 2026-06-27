import { apiRequest } from "./api";
import type {
  Booking,
  BookingLookupResult,
  CreateBookingPayload,
  CreateBookingResult,
  MyBookingsResult,
} from "@/types/bookings";

export const bookingKeys = {
  mine: ["bookings", "mine"] as const,
  guest: ["bookings", "guest"] as const,
};

export const createBooking = (payload: CreateBookingPayload) =>
  apiRequest<CreateBookingResult>("/bookings", {
    method: "POST",
    data: payload,
  });

export const getMyBookings = () => apiRequest<MyBookingsResult>("/bookings/me");

export const lookupGuestBookings = (email: string, licensePlate: string) =>
  apiRequest<BookingLookupResult>("/bookings/check", {
    params: {
      email,
      licensePlate,
    },
  });

export const confirmBooking = ({
  id,
  email,
  licensePlate,
}: {
  id: string;
  email?: string;
  licensePlate?: string;
}) =>
  apiRequest<{ booking: Booking }>(`/bookings/${id}/confirm`, {
    method: "POST",
    data: {
      email,
      licensePlate,
    },
  });

export const cancelBooking = ({
  id,
  email,
  licensePlate,
}: {
  id: string;
  email?: string;
  licensePlate?: string;
}) =>
  apiRequest<{ booking: Booking }>(`/bookings/${id}/cancel`, {
    method: "PATCH",
    data: {
      email,
      licensePlate,
    },
  });
