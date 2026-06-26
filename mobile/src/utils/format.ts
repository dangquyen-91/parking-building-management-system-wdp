import type { Plan } from "@/types/subscriptions";

const VIETNAMESE_LOCALE = "vi-VN";

export const formatMoney = (value: number) =>
  `${value.toLocaleString(VIETNAMESE_LOCALE)} VND`;

export const formatDate = (value?: string | null) =>
  value
    ? new Date(value).toLocaleDateString(VIETNAMESE_LOCALE, {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Chưa bắt đầu";

export const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString(VIETNAMESE_LOCALE, {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "2-digit",
      })
    : "Chưa có";

export const formatDateTimeWithYear = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString(VIETNAMESE_LOCALE, {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Chưa có";

export const formatPickerDate = (value: Date) =>
  value.toLocaleDateString(VIETNAMESE_LOCALE, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

export const formatPickerTime = (value: Date) =>
  value.toLocaleTimeString(VIETNAMESE_LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatDurationHours = (value: number) => `${value} tiếng`;

export const formatVehicleType = (value: Plan["vehicleType"]) =>
  value === "car" ? "Ô tô" : "Xe máy";

export const formatSubscriptionStatus = (value?: string | null) => {
  switch (value) {
    case "pending":
      return "Chờ thanh toán";
    case "active":
      return "Đang hoạt động";
    case "expired":
      return "Hết hạn";
    case "cancelled":
      return "Đã hủy";
    default:
      return "Không xác định";
  }
};

export const formatBookingStatus = (value?: string | null) => {
  switch (value) {
    case "pending":
      return "Chờ thanh toán";
    case "paid":
      return "Đã thanh toán";
    case "used":
      return "Đã sử dụng";
    case "expired":
      return "Hết hạn";
    case "cancelled":
      return "Đã hủy";
    default:
      return "Không xác định";
  }
};

export const formatSlotStatus = (value?: string | null) => {
  switch (value) {
    case "empty":
      return "Trống";
    case "occupied":
      return "Đã có xe";
    case "reserved":
      return "Đã giữ chỗ";
    case "maintenance":
      return "Bảo trì";
    default:
      return "Không xác định";
  }
};

export const formatRole = (role?: string) =>
  role
    ? ({
        admin: "Quản trị viên",
        resident: "Cư dân",
        customer: "Khách hàng",
        guest: "Khách vãng lai",
        staff: "Nhân viên",
        security: "Bảo vệ",
      }[role.toLowerCase()] ??
      role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()))
    : "Người dùng";
