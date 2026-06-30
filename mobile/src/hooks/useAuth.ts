import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addMyVehicle,
  authKeys,
  getCurrentUser,
  login,
  logout,
  register,
  updateMyProfile,
} from "@/lib/auth";

export const useCurrentUserQuery = () =>
  useQuery({
    queryKey: authKeys.currentUser,
    queryFn: getCurrentUser,
  });

export const useLoginMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      queryClient.setQueryData(authKeys.currentUser, session.user);
    },
  });
};

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: register,
  });

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.setQueryData(authKeys.currentUser, null);
      queryClient.removeQueries({ queryKey: ["bookings"] });
      queryClient.removeQueries({ queryKey: ["subscriptions"] });
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyProfile,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser, user);
    },
  });
};

export const useAddVehicleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addMyVehicle,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser, user);
    },
  });
};
