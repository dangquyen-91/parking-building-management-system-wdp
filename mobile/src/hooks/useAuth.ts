import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  addMyVehicle,
  authKeys,
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
