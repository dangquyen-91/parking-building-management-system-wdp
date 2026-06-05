import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { authKeys, login, logout, register } from "@/lib/auth";
import { getStoredUser } from "@/lib/auth-storage";

export const useCurrentUserQuery = () =>
  useQuery({
    queryKey: authKeys.currentUser,
    queryFn: getStoredUser,
    staleTime: Infinity,
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
    },
  });
};
