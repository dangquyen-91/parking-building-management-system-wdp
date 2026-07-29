import axios, { AxiosError } from "axios";

import {
  clearAuthTokens,
  getAccessToken,
  getRefreshToken,
  saveAuthTokens,
} from "./auth-storage";

const API_URL = process.env.EXPO_PUBLIC_API_URL;

type ApiEnvelope<T> = {
  status: "success" | "error" | "fail";
  message?: string;
  data?: T;
};

type RetriableRequestConfig = Parameters<typeof apiClient.request>[0] & {
  _retry?: boolean;
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

const API_ERROR_TRANSLATIONS: Array<[RegExp, string]> = [
  [/^Invalid email or password$/i, "Email hoặc mật khẩu không đúng."],
  [/^Email already in use$/i, "Email đã được sử dụng."],
  [/^Account is deactivated$/i, "Tài khoản đã bị vô hiệu hóa."],
  [/^No token provided$/i, "Phiên đăng nhập không tồn tại. Vui lòng đăng nhập lại."],
  [/^Invalid or expired token$/i, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."],
  [/^Invalid or expired refresh token$/i, "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."],
  [/^Refresh token mismatch$/i, "Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại."],
  [/^No refresh token provided$/i, "Phiên đăng nhập không tồn tại. Vui lòng đăng nhập lại."],
  [/^User not found or inactive$/i, "Không tìm thấy tài khoản hoặc tài khoản đã bị khóa."],
  [/^User not found$/i, "Không tìm thấy người dùng."],
  [/^User account is inactive$/i, "Tài khoản đã bị vô hiệu hóa."],
  [/^You do not have permission to perform this action$/i, "Bạn không có quyền thực hiện thao tác này."],
  [/^Registration successful$/i, "Đăng ký thành công."],
  [/^Login successful$/i, "Đăng nhập thành công."],
  [/^Token refreshed$/i, "Đã làm mới phiên đăng nhập."],
  [/^Logged out successfully$/i, "Đăng xuất thành công."],
  [/^Booking not found$/i, "Không tìm thấy lượt đặt chỗ."],
  [/^Booking created, awaiting payment$/i, "Đã tạo yêu cầu thanh toán cho lượt đặt chỗ."],
  [/^expectedArrivalTime must be in the future$/i, "Thời gian đến phải ở tương lai."],
  [/^Bookings can only be made up to 24 hours in advance$/i, "Chỉ được đặt chỗ trước tối đa 24 giờ."],
  [/^expectedExitTime must be after expectedArrivalTime$/i, "Thời gian rời đi phải sau thời gian đến."],
  [/^Booking duration must be at least (\d+) hour\(s\)$/i, "Thời gian đặt chỗ tối thiểu là $1 giờ."],
  [/^Booking duration cannot exceed (\d+) hours$/i, "Thời gian đặt chỗ không được vượt quá $1 giờ."],
  [/^License plate (.+) currently has an active parking session/i, "Biển số $1 đang có phiên gửi xe active. Vui lòng chờ xe rời bãi."],
  [/^License plate (.+) already has a booking overlapping this time range$/i, "Biển số $1 đã có lượt đặt chỗ trùng thời gian này."],
  [/^No visitor car floor configured$/i, "Chưa cấu hình tầng ô tô cho khách vãng lai."],
  [/^No availability in the requested time window/i, "Không còn chỗ trống trong khung thời gian đã chọn."],
  [/^Anonymous booking requires email \+ licensePlate to cancel$/i, "Cần email và biển số để hủy lượt đặt chỗ vãng lai."],
  [/^Anonymous booking requires email \+ licensePlate to confirm$/i, "Cần email và biển số để xác nhận lượt đặt chỗ vãng lai."],
  [/^email or licensePlate does not match$/i, "Email hoặc biển số không khớp với lượt đặt chỗ."],
  [/^Cannot cancel a (.+) booking$/i, "Không thể hủy lượt đặt chỗ đang ở trạng thái $1."],
  [/^Paid bookings cannot be cancelled/i, "Lượt đặt chỗ đã thanh toán không thể hủy."],
  [/^No payment found for this booking$/i, "Không tìm thấy thanh toán cho lượt đặt chỗ này."],
  [/^Plan not found$/i, "Không tìm thấy gói gửi xe."],
  [/^Plan is inactive$/i, "Gói gửi xe đã ngừng hoạt động."],
  [/^Plan (.+) not found or inactive$/i, "Không tìm thấy gói $1 hoặc gói đã ngừng hoạt động."],
  [/^slotId is required for car subscriptions/i, "Gói ô tô cần chọn vị trí đỗ cố định."],
  [/^Motorcycle subscriptions do not lock a slot/i, "Gói xe máy không cần chọn ô đỗ cố định."],
  [/^License plate (.+) already has an active subscription$/i, "Biển số $1 đã có gói gửi xe đang hoạt động."],
  [/^Parking slot not found$/i, "Không tìm thấy ô đỗ."],
  [/^Slot must be a car slot$/i, "Ô đỗ phải là ô dành cho ô tô."],
  [/^Floor is inactive$/i, "Tầng đỗ xe đã ngừng hoạt động."],
  [/^Building is inactive$/i, "Tòa nhà đã ngừng hoạt động."],
  [/^Subscription slot must be on a resident floor$/i, "Ô đăng ký phải nằm ở tầng dành cho cư dân."],
  [/^Slot (.+) is already reserved by another subscription$/i, "Ô $1 đã được giữ bởi gói khác."],
  [/^Slot is no longer available/i, "Ô đỗ không còn khả dụng."],
  [/^Subscription not found$/i, "Không tìm thấy gói gửi xe."],
  [/^You can only confirm your own subscription$/i, "Bạn chỉ có thể xác nhận gói của mình."],
  [/^You can only cancel your own subscription$/i, "Bạn chỉ có thể hủy gói của mình."],
  [/^Only pending subscriptions can be cancelled$/i, "Chỉ có thể hủy gói đang chờ thanh toán."],
  [/^No payment found for this subscription$/i, "Không tìm thấy thanh toán cho gói này."],
  [/^No payment found for this orderCode$/i, "Không tìm thấy thanh toán cho mã đơn này."],
  [/^QR only available for active subscriptions$/i, "Chỉ gói đang hoạt động mới có mã QR."],
  [/^Vehicle (.+) already has an active parking session$/i, "Xe $1 đang có phiên gửi xe active."],
  [/^No visitor car capacity available/i, "Bãi ô tô khách đã đầy."],
  [/^No motorcycle capacity available/i, "Khu xe máy đã đầy."],
  [/^Parking row not found$/i, "Không tìm thấy hàng đỗ xe."],
  [/^This slot only accepts car$/i, "Ô này chỉ nhận ô tô."],
  [/^This row only accepts motorcycle$/i, "Hàng này chỉ nhận xe máy."],
  [/^Session not found$/i, "Không tìm thấy phiên gửi xe."],
  [/^Payment not found$/i, "Không tìm thấy thanh toán."],
  [/^Cannot create payment link/i, "Không thể tạo liên kết thanh toán. Vui lòng thử lại."],
  [/^Cannot fetch payment info/i, "Không thể lấy thông tin thanh toán. Vui lòng thử lại."],
  [/^Cannot cancel payment link/i, "Không thể hủy liên kết thanh toán. Vui lòng thử lại."],
  [/^Invalid webhook signature$/i, "Chữ ký webhook không hợp lệ."],
];

export const translateApiMessage = (message?: string | null, status?: number) => {
  const rawMessage = message?.trim();

  if (!rawMessage) {
    return "Yêu cầu thất bại";
  }

  for (const [pattern, replacement] of API_ERROR_TRANSLATIONS) {
    if (pattern.test(rawMessage)) {
      return rawMessage.replace(pattern, replacement);
    }
  }

  if (/^Network Error$/i.test(rawMessage)) {
    return "Không thể kết nối máy chủ. Vui lòng kiểm tra mạng.";
  }

  if (/timeout/i.test(rawMessage)) {
    return "Kết nối quá lâu. Vui lòng thử lại.";
  }

  if (status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  }

  if (status === 403) {
    return "Bạn không có quyền thực hiện thao tác này.";
  }

  if (status === 404) {
    return "Không tìm thấy dữ liệu cần xử lý.";
  }

  if (status && status >= 500) {
    return "Máy chủ đang gặp sự cố. Vui lòng thử lại sau.";
  }

  return rawMessage;
};

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

let refreshTokenRequest: Promise<string | null> | null = null;

apiClient.interceptors.request.use(async (config) => {
  const token = await getAccessToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

const refreshAccessToken = async () => {
  const refreshToken = await getRefreshToken();

  if (!refreshToken) {
    return null;
  }

  const response = await axios.post<ApiEnvelope<{ accessToken: string; refreshToken: string }>>(
    `${API_URL}/auth/refresh-token`,
    { refreshToken },
    {
      headers: { "Content-Type": "application/json" },
      timeout: 15000,
    },
  );

  const tokens = response.data.data;
  if (!tokens?.accessToken || !tokens.refreshToken) {
    return null;
  }

  await saveAuthTokens(tokens.accessToken, tokens.refreshToken);
  return tokens.accessToken;
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiEnvelope<unknown>>) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      throw error;
    }

    originalRequest._retry = true;
    refreshTokenRequest ??= refreshAccessToken().finally(() => {
      refreshTokenRequest = null;
    });

    let nextAccessToken: string | null;
    try {
      nextAccessToken = await refreshTokenRequest;
    } catch {
      await clearAuthTokens();
      throw error;
    }

    if (!nextAccessToken) {
      await clearAuthTokens();
      throw error;
    }

    originalRequest.headers = originalRequest.headers ?? {};
    originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`;
    return apiClient.request(originalRequest);
  },
);

export const unwrapApiError = (error: unknown) => {
  if (error instanceof ApiError) {
    return new ApiError(translateApiMessage(error.message, error.status), error.status);
  }

  if (error instanceof AxiosError) {
    const payload = error.response?.data as Partial<ApiEnvelope<unknown>> | undefined;
    const status = error.response?.status ?? 0;
    return new ApiError(
      translateApiMessage(payload?.message ?? error.message, status),
      status,
    );
  }

  return new ApiError(
    translateApiMessage(error instanceof Error ? error.message : "Yêu cầu thất bại", 0),
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
      throw new ApiError(translateApiMessage(payload.message, response.status), response.status);
    }

    if (payload.data === undefined) {
      throw new ApiError("Phản hồi từ máy chủ không hợp lệ", response.status);
    }

    return payload.data;
  } catch (error) {
    throw unwrapApiError(error);
  }
};
