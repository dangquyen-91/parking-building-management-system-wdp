import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { bookingKeys, createBooking, getMyBookings } from "@/lib/bookings";

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

