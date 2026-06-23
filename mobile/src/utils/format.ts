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
    : "Not started";

export const formatDateTime = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString(VIETNAMESE_LOCALE, {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "2-digit",
      })
    : "Not available";

export const formatDateTimeWithYear = (value?: string | null) =>
  value
    ? new Date(value).toLocaleString(VIETNAMESE_LOCALE, {
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        month: "2-digit",
        year: "numeric",
      })
    : "Not available";

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

export const formatDurationHours = (value: number) =>
  `${value} hour${value > 1 ? "s" : ""}`;

export const formatVehicleType = (value: Plan["vehicleType"]) =>
  value === "car" ? "Car" : "Motorcycle";

export const formatRole = (role?: string) =>
  role
    ? role.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
    : "User";
