import { apiRequest } from "./api";
import {
  clearAuthTokens,
  getAccessToken,
  saveAuthTokens,
  saveStoredUser,
} from "./auth-storage";
import type {
  AddVehiclePayload,
  AuthSession,
  ForgotPasswordPayload,
  LoginPayload,
  RegisterPayload,
  ResendVerificationPayload,
  ResetPasswordPayload,
  UpdateProfilePayload,
  User,
  VerifyEmailPayload,
} from "@/types/auth";

export const authKeys = {
  currentUser: ["auth", "currentUser"] as const,
};

export const saveAuthSession = async (session: AuthSession) => {
  await Promise.all([
    saveAuthTokens(session.accessToken, session.refreshToken),
    saveStoredUser(session.user),
  ]);
};

export const fetchCurrentUser = async () => {
  const { user } = await apiRequest<{ user: User }>("/users/me");
  await saveStoredUser(user);

  return user;
};

export const getCurrentUser = async () => {
  const token = await getAccessToken();

  if (!token) {
    return null;
  }

  return fetchCurrentUser();
};

export const login = async (payload: LoginPayload) => {
  const session = await apiRequest<AuthSession>("/auth/login", {
    method: "POST",
    data: payload,
  });

  await saveAuthSession(session);
  return session;
};

export const register = (payload: RegisterPayload) =>
  apiRequest<{ user: User }>("/auth/register", {
    method: "POST",
    data: payload,
  });

export const verifyEmail = (payload: VerifyEmailPayload) =>
  apiRequest<null>("/auth/verify-email", {
    method: "POST",
    data: payload,
  });

export const resendVerification = (payload: ResendVerificationPayload) =>
  apiRequest<null>("/auth/resend-verification", {
    method: "POST",
    data: payload,
  });

export const forgotPassword = (payload: ForgotPasswordPayload) =>
  apiRequest<null>("/auth/forgot-password", {
    method: "POST",
    data: payload,
  });

export const resetPassword = (payload: ResetPasswordPayload) =>
  apiRequest<null>("/auth/reset-password", {
    method: "POST",
    data: payload,
  });

export const logout = async () => {
  try {
    await apiRequest<null>("/auth/logout", {
      method: "POST",
    });
  } finally {
    await clearAuthTokens();
  }
};

export const updateMyProfile = async (payload: UpdateProfilePayload) => {
  const { user } = await apiRequest<{ user: User }>("/users/me", {
    method: "PATCH",
    data: payload,
  });

  await saveStoredUser(user);
  return user;
};

export const addMyVehicle = async (payload: AddVehiclePayload) => {
  const { user } = await apiRequest<{ user: User }>("/users/me/vehicles", {
    method: "POST",
    data: {
      ...payload,
      licensePlate: payload.licensePlate.trim().toUpperCase(),
    },
  });

  await saveStoredUser(user);
  return user;
};

export const removeMyVehicle = async (vehicleId: string) => {
  const { user } = await apiRequest<{ user: User }>(`/users/me/vehicles/${vehicleId}`, {
    method: "DELETE",
  });

  await saveStoredUser(user);
  return user;
};
