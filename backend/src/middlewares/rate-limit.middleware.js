import rateLimit from 'express-rate-limit';

// Chỉ áp dụng cho /login và /register
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many login attempts, please try again later' },
});

// Áp dụng cho /refresh-token — cần limit cao hơn vì app tự gọi
export const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { status: 'fail', message: 'Too many token refresh attempts, please try again later' },
});
