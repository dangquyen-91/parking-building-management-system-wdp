import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  bookingKeys,
  createBooking,
  getGuestBookings,
  getMyBookings,
  saveGuestBooking,
} from "@/lib/bookings";
import type { CreateBookingResult } from "@/types/bookings";

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
    queryFn: getGuestBookings,
    enabled,
  });

export const useSaveGuestBookingMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (result: CreateBookingResult) => saveGuestBooking(result),
    onSuccess: (bookings) => {
      queryClient.setQueryData(bookingKeys.guest, bookings);
    },
  });
};

