import { apiRequest } from "./api";
import { clearAuthTokens, saveAuthTokens, saveStoredUser } from "./auth-storage";
import type { AuthSession, LoginPayload, RegisterPayload, User } from "@/types/auth";

export const authKeys = {
  currentUser: ["auth", "currentUser"] as const,
};

export const saveAuthSession = async (session: AuthSession) => {
  await Promise.all([
    saveAuthTokens(session.accessToken, session.refreshToken),
    saveStoredUser(session.user),
  ]);
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

export const logout = async () => {
  try {
    await apiRequest<null>("/auth/logout", {
      method: "POST",
    });
  } finally {
    await clearAuthTokens();
  }
};
