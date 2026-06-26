import { z } from "zod";

export const userSchema = z.object({
  _id: z.string().min(1),
  fullName: z.string().min(1),
  email: z.email(),
  phone: z.string().optional(),
  role: z.string().min(1),
  isActive: z.boolean(),
});

export const loginPayloadSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email là bắt buộc.")
    .email("Vui lòng nhập địa chỉ email hợp lệ."),
  password: z.string().min(1, "Mật khẩu là bắt buộc."),
});

export const registerPayloadSchema = z.object({
  fullName: z.string().trim().min(1, "Họ và tên là bắt buộc."),
  email: z
    .string()
    .trim()
    .min(1, "Email là bắt buộc.")
    .email("Vui lòng nhập địa chỉ email hợp lệ."),
  phone: z.string().trim().optional(),
  password: z.string().min(1, "Mật khẩu là bắt buộc."),
});

export const authSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  user: userSchema,
});
