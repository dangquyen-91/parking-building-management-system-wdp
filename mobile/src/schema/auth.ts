import { z } from "zod";

export const userSchema = z.object({
  _id: z.string().min(1),
  fullName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  cccd: z.string().optional(),
  dateOfBirth: z.string().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: z.string().optional(),
  vehicles: z
    .array(
      z.object({
        _id: z.string().optional(),
        licensePlate: z.string().min(1),
        vehicleType: z.enum(["car", "motorcycle"]),
      }),
    )
    .optional(),
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

export const verifyEmailPayloadSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email là bắt buộc.")
    .email("Vui lòng nhập địa chỉ email hợp lệ."),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Mã OTP phải gồm đúng 6 chữ số."),
});

export const resendVerificationPayloadSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email là bắt buộc.")
    .email("Vui lòng nhập địa chỉ email hợp lệ."),
});

export const forgotPasswordPayloadSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email là bắt buộc.")
    .email("Vui lòng nhập địa chỉ email hợp lệ."),
});

export const resetPasswordPayloadSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email là bắt buộc.")
    .email("Vui lòng nhập địa chỉ email hợp lệ."),
  otp: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Mã OTP phải gồm đúng 6 chữ số."),
  newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự."),
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

export const updateProfilePayloadSchema = z.object({
  fullName: z.string().trim().min(2).max(100).optional(),
  email: z.string().trim().email().optional(),
  phone: z.string().trim().optional(),
  cccd: z.string().trim().optional(),
  dateOfBirth: z.string().trim().optional(),
  gender: z.enum(["male", "female", "other"]).optional(),
  address: z.string().trim().max(255).optional(),
});

export const addVehiclePayloadSchema = z.object({
  licensePlate: z.string().trim().min(4).max(12),
  vehicleType: z.enum(["car", "motorcycle"]),
});
