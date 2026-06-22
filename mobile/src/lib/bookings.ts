import AsyncStorage from "@react-native-async-storage/async-storage";

import { apiRequest } from "./api";
import type {
  CreateBookingPayload,
  CreateBookingResult,
  MyBookingsResult,
  StoredGuestBooking,
} from "@/types/bookings";

const GUEST_BOOKINGS_KEY = "parking_guest_bookings";
const MAX_GUEST_BOOKINGS = 20;

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

export const getGuestBookings = async (): Promise<StoredGuestBooking[]> => {
  const rawBookings = await AsyncStorage.getItem(GUEST_BOOKINGS_KEY);

  if (!rawBookings) {
    return [];
  }

  try {
    return JSON.parse(rawBookings) as StoredGuestBooking[];
  } catch {
    await AsyncStorage.removeItem(GUEST_BOOKINGS_KEY);
    return [];
  }
};

export const saveGuestBooking = async ({
  booking,
  payment,
}: CreateBookingResult) => {
  const currentBookings = await getGuestBookings();
  const storedBooking: StoredGuestBooking = {
    ...booking,
    payment,
    savedAt: new Date().toISOString(),
  };
  const nextBookings = [
    storedBooking,
    ...currentBookings.filter((item) => item._id !== booking._id),
  ].slice(0, MAX_GUEST_BOOKINGS);

  await AsyncStorage.setItem(GUEST_BOOKINGS_KEY, JSON.stringify(nextBookings));
  return nextBookings;
};
