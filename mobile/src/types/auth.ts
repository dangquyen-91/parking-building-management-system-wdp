export type UserGender = "male" | "female" | "other";

export type UserVehicle = {
  _id?: string;
  licensePlate: string;
  vehicleType: "car" | "motorcycle";
};

export type User = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  cccd?: string;
  dateOfBirth?: string;
  gender?: UserGender;
  address?: string;
  vehicles?: UserVehicle[];
  role: string;
  isActive: boolean;
};

export type UpdateProfilePayload = {
  fullName?: string;
  email?: string;
  phone?: string;
  cccd?: string;
  dateOfBirth?: string;
  gender?: UserGender;
  address?: string;
};

export type AddVehiclePayload = {
  licensePlate: string;
  vehicleType: "car" | "motorcycle";
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type VerifyEmailPayload = {
  email: string;
  otp: string;
};

export type ResendVerificationPayload = {
  email: string;
};

export type ForgotPasswordPayload = {
  email: string;
};

export type ResetPasswordPayload = {
  email: string;
  otp: string;
  newPassword: string;
};

export type RegisterPayload = {
  fullName: string;
  email: string;
  phone?: string;
  password: string;
};

export type AuthSession = {
  accessToken: string;
  refreshToken: string;
  user: User;
};
