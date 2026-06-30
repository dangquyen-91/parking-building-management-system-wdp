import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import User from '../models/user.model.js';
import AppError from '../utils/appError.js';
import { sendVerificationEmail } from './email.service.js';

const generateOtp = () => String(crypto.randomInt(100000, 1000000)).padStart(6, '0');

const generateTokens = (userId) => {
  const accessToken = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });
  const refreshToken = jwt.sign({ id: userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  });
  return { accessToken, refreshToken };
};

export const register = async ({ fullName, email, password, phone }) => {
  const existing = await User.findOne({ email }).select('+emailVerificationOtp +emailVerificationExpires');

  if (existing?.isEmailVerified) throw new AppError('Email already in use', 400);

  const otp = generateOtp();
  const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 phút

  if (existing) {
    // Email chưa verify — cập nhật password + OTP mới
    existing.password = password;
    existing.fullName = fullName;
    existing.phone = phone;
    existing.emailVerificationOtp = otp;
    existing.emailVerificationExpires = expires;
    await existing.save();
    sendVerificationEmail({ email, otp });
    return { message: 'OTP mới đã được gửi. Vui lòng kiểm tra email.' };
  }

  const user = await User.create({
    fullName,
    email,
    password,
    phone,
    emailVerificationOtp: otp,
    emailVerificationExpires: expires,
  });
  user.password = undefined;

  sendVerificationEmail({ email, otp });
  return { message: 'Đăng ký thành công. Vui lòng kiểm tra email để lấy mã OTP.' };
};

export const verifyEmail = async ({ email, otp }) => {
  const user = await User.findOne({ email }).select('+emailVerificationOtp +emailVerificationExpires');
  if (!user) throw new AppError('Email không tồn tại', 404);
  if (user.isEmailVerified) throw new AppError('Email đã được xác thực', 400);
  if (!user.emailVerificationOtp || !user.emailVerificationExpires) {
    throw new AppError('Chưa có mã OTP. Vui lòng đăng ký lại.', 400);
  }
  if (user.emailVerificationExpires < new Date()) {
    throw new AppError('Mã OTP đã hết hạn. Vui lòng yêu cầu gửi lại.', 400);
  }
  if (user.emailVerificationOtp !== otp) {
    throw new AppError('Mã OTP không đúng', 400);
  }

  user.isEmailVerified = true;
  user.emailVerificationOtp = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  return { message: 'Xác thực email thành công. Bạn có thể đăng nhập.' };
};

export const resendVerification = async ({ email }) => {
  const user = await User.findOne({ email }).select('+emailVerificationExpires');
  if (!user) throw new AppError('Email không tồn tại', 404);
  if (user.isEmailVerified) throw new AppError('Email đã được xác thực', 400);

  // Chống spam: chỉ cho resend sau 1 phút kể từ lần gửi trước
  if (user.emailVerificationExpires && user.emailVerificationExpires > new Date(Date.now() + 9 * 60 * 1000)) {
    throw new AppError('Vui lòng chờ ít nhất 1 phút trước khi gửi lại OTP', 429);
  }

  const otp = generateOtp();
  user.emailVerificationOtp = otp;
  user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000);
  await user.save({ validateBeforeSave: false });

  sendVerificationEmail({ email, otp });
  return { message: 'OTP mới đã được gửi. Vui lòng kiểm tra email.' };
};

export const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  if (!user.isEmailVerified) throw new AppError('Email chưa được xác thực. Vui lòng kiểm tra hộp thư và nhập mã OTP.', 403);
  if (!user.isActive) throw new AppError('Account is deactivated', 403);

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  user.password = undefined;
  user.refreshToken = undefined;

  return { accessToken, refreshToken, user };
};

export const refreshAccessToken = async (token) => {
  if (!token) throw new AppError('No refresh token provided', 401);

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  } catch {
    throw new AppError('Invalid or expired refresh token', 401);
  }

  const user = await User.findById(decoded.id).select('+refreshToken');
  if (!user || user.refreshToken !== token) {
    throw new AppError('Refresh token mismatch', 401);
  }

  const { accessToken, refreshToken } = generateTokens(user._id);
  user.refreshToken = refreshToken;
  await user.save({ validateBeforeSave: false });

  return { accessToken, refreshToken };
};

export const logout = async (userId) => {
  await User.findByIdAndUpdate(userId, { refreshToken: null });
};
