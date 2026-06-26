import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  bookingKeys,
  cancelBooking,
  confirmBooking,
  createBooking,
  getMyBookings,
} from "@/lib/bookings";
import type { CreateBookingResult, StoredGuestBooking } from "@/types/bookings";

const MAX_GUEST_BOOKINGS = 20;

const mergeGuestBookings = (
  currentBookings: StoredGuestBooking[],
  booking: StoredGuestBooking,
) =>
  [booking, ...currentBookings.filter((item) => item._id !== booking._id)].slice(
    0,
    MAX_GUEST_BOOKINGS,
  );

export const useCreateBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.mine });
    },
  });
};

export const useMyBookingsQuery = (enabled: boolean) =>
  useQuery({
    queryKey: bookingKeys.mine,
    queryFn: getMyBookings,
    enabled,
  });

export const useGuestBookingsQuery = (enabled = true) =>
  useQuery({
    queryKey: bookingKeys.guest,
    queryFn: async () => [] as StoredGuestBooking[],
    enabled,
    initialData: [] as StoredGuestBooking[],
  });

export const useSaveGuestBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (result: CreateBookingResult) => {
      const currentBookings =
        queryClient.getQueryData<StoredGuestBooking[]>(bookingKeys.guest) ?? [];
      return mergeGuestBookings(currentBookings, {
        ...result.booking,
        payment: result.payment,
        savedAt: new Date().toISOString(),
      });
    },
    onSuccess: (bookings) => {
      queryClient.setQueryData(bookingKeys.guest, bookings);
    },
  });
};

export const useUpsertGuestBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (booking: StoredGuestBooking) => {
      const currentBookings =
        queryClient.getQueryData<StoredGuestBooking[]>(bookingKeys.guest) ?? [];
      return mergeGuestBookings(currentBookings, booking);
    },
    onSuccess: (bookings) => {
      queryClient.setQueryData(bookingKeys.guest, bookings);
    },
  });
};

export const useConfirmBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: confirmBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.mine });
    },
  });
};

export const useCancelBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelBooking,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bookingKeys.mine });
    },
  });
};

