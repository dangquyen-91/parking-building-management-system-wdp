import * as SecureStore from "expo-secure-store";

import type { User } from "@/types/auth";

const ACCESS_TOKEN_KEY = "parking_access_token";
const REFRESH_TOKEN_KEY = "parking_refresh_token";
const USER_KEY = "parking_user";

export const getAccessToken = () => SecureStore.getItemAsync(ACCESS_TOKEN_KEY);

export const getRefreshToken = () => SecureStore.getItemAsync(REFRESH_TOKEN_KEY);

export const getStoredUser = async () => {
  const userJson = await SecureStore.getItemAsync(USER_KEY);

  if (!userJson) {
    return null;
  }

  return JSON.parse(userJson) as User;
};

export const saveAuthTokens = async (
  accessToken: string,
  refreshToken: string,
) => {
  await Promise.all([
    SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken),
    SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken),
  ]);
};

export const saveStoredUser = (user: User) =>
  SecureStore.setItemAsync(USER_KEY, JSON.stringify(user));

export const clearAuthTokens = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ]);
};
