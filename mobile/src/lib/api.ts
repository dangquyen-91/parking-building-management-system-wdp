import axios, { AxiosError } from "axios";

import { getAccessToken } from "./auth-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type ApiEnvelope<T> = {
  status: "success" | "error" | "fail";
  message?: string;
  data?: T;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const unwrapApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return error;
  }

  if (error instanceof AxiosError) {
    const payload = error.response?.data as Partial<ApiEnvelope<unknown>> | undefined;
    return new ApiError(
      payload?.message ?? error.message ?? "Request failed",
      error.response?.status ?? 0,
    );
  }

  return new ApiError(
    error instanceof Error ? error.message : "Request failed",
    0,
  );
};

export const apiRequest = async <T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
    data?: unknown;
    params?: Record<string, unknown>;
  } = {},
): Promise<T> => {
  try {
    const response = await apiClient.request<ApiEnvelope<T>>({
      url: path,
      method: options.method ?? "GET",
      data: options.data,
      params: options.params,
    });

    const payload = response.data;

    if (payload.status === "error" || payload.status === "fail") {
      throw new ApiError(payload.message ?? "Request failed", response.status);
    }

    if (payload.data === undefined) {
      throw new ApiError("Invalid server response", response.status);
    }

    return payload.data;
  } catch (error) {
    throw unwrapApiError(error);
  }
};
