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
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export const registerPayloadSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required."),
  email: z
    .string()
    .trim()
    .min(1, "Email is required.")
    .email("Please enter a valid email address."),
  phone: z.string().trim().optional(),
  password: z.string().min(1, "Password is required."),
});

export const authSessionSchema = z.object({
  accessToken: z.string().min(1),
  refreshToken: z.string().min(1),
  user: userSchema,
});
