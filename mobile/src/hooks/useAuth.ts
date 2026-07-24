import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addMyVehicle,
  authKeys,
  fetchCurrentUser,
  forgotPassword,
  getCurrentUser,
  login,
  logout,
  removeMyVehicle,
  register,
  resendVerification,
  resetPassword,
  updateMyProfile,
  verifyEmail,
} from "@/lib/auth";
import { ApiError } from "@/lib/api";
import { clearAuthTokens, getAccessToken, getStoredUser } from "@/lib/auth-storage";

export const useCurrentUserQuery = () => {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: authKeys.currentUser,
    queryFn: async () => {
      const [token, storedUser] = await Promise.all([getAccessToken(), getStoredUser()]);

      if (!token) {
        return null;
      }

      if (storedUser) {
        void fetchCurrentUser()
          .then((user) => queryClient.setQueryData(authKeys.currentUser, user))
          .catch(async (error) => {
            // Keep cached user through transient network errors; clear only when
            // the server confirms the session is no longer valid.
            if (error instanceof ApiError && [401, 403].includes(error.status)) {
              await clearAuthTokens();
              queryClient.setQueryData(authKeys.currentUser, null);
            }
          });

        return storedUser;
      }

      return getCurrentUser();
    },
    retry: 0,
  });
};

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

export const useVerifyEmailMutation = () =>
  useMutation({
    mutationFn: verifyEmail,
  });

export const useResendVerificationMutation = () =>
  useMutation({
    mutationFn: resendVerification,
  });

export const useForgotPasswordMutation = () =>
  useMutation({
    mutationFn: forgotPassword,
  });

export const useResetPasswordMutation = () =>
  useMutation({
    mutationFn: resetPassword,
  });

export const useLogoutMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.setQueryData(authKeys.currentUser, null);
      queryClient.removeQueries({ queryKey: ["bookings"] });
      queryClient.removeQueries({ queryKey: ["complaints"] });
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

export const useRemoveVehicleMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeMyVehicle,
    onSuccess: (user) => {
      queryClient.setQueryData(authKeys.currentUser, user);
    },
  });
};
