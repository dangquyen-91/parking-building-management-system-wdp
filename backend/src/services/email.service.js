// Brevo (Sendinblue) transactional email over HTTPS — works on hosts that
// block outbound SMTP ports (e.g. Render free tier blocks 465/587).
const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

const sendEmail = async ({ to, subject, htmlContent }) => {
  const { BREVO_API_KEY, BREVO_SENDER_EMAIL, BREVO_SENDER_NAME } = process.env;
  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
    console.warn('Email not configured (BREVO_API_KEY/BREVO_SENDER_EMAIL missing) — emails skipped');
    return;
  }

  const res = await fetch(BREVO_ENDPOINT, {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
      accept: 'application/json',
    },
    body: JSON.stringify({
      sender: { name: BREVO_SENDER_NAME || 'Parking Building', email: BREVO_SENDER_EMAIL },
      to: [{ email: to }],
      subject,
      htmlContent,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Brevo API error ${res.status}: ${body}`);
  }
};

const buildVerificationHtml = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #1565c0; margin-bottom: 8px;">Xác thực địa chỉ email</h2>
    <p style="color: #555;">Chào mừng bạn đến với <b>Parking Building Management System</b>!</p>
    <p style="color: #555;">Nhập mã OTP dưới đây để hoàn tất đăng ký. Mã có hiệu lực trong <b>10 phút</b>.</p>
    <div style="text-align: center; margin: 32px 0;">
      <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #1565c0; background: #e3f2fd; padding: 16px 24px; border-radius: 8px;">${otp}</span>
    </div>
    <p style="color: #888; font-size: 13px;">Nếu bạn không tạo tài khoản này, hãy bỏ qua email này.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="color: #bbb; font-size: 12px; text-align: center;">Parking Building Management System</p>
  </div>
`;

const buildPasswordResetHtml = (otp) => `
  <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 24px; border: 1px solid #e0e0e0; border-radius: 8px;">
    <h2 style="color: #c62828; margin-bottom: 8px;">Đặt lại mật khẩu</h2>
    <p style="color: #555;">Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
    <p style="color: #555;">Nhập mã OTP dưới đây để xác nhận. Mã có hiệu lực trong <b>10 phút</b>.</p>
    <div style="text-align: center; margin: 32px 0;">
      <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #c62828; background: #ffebee; padding: 16px 24px; border-radius: 8px;">${otp}</span>
    </div>
    <p style="color: #888; font-size: 13px;">Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này. Mật khẩu sẽ không thay đổi.</p>
    <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;">
    <p style="color: #bbb; font-size: 12px; text-align: center;">Parking Building Management System</p>
  </div>
`;

export const sendPasswordResetEmail = async ({ email, otp }) => {
  try {
    await sendEmail({
      to: email,
      subject: 'Mã OTP đặt lại mật khẩu',
      htmlContent: buildPasswordResetHtml(otp),
    });
    console.log('Password reset email sent', { email });
  } catch (err) {
    console.error('Failed to send password reset email', { error: err.message, email });
  }
};

export const sendVerificationEmail = async ({ email, otp }) => {
  try {
    await sendEmail({
      to: email,
      subject: 'Mã xác thực đăng ký tài khoản',
      htmlContent: buildVerificationHtml(otp),
    });
    console.log('Verification email sent', { email });
  } catch (err) {
    console.error('Failed to send verification email', { error: err.message, email });
  }
};

const formatDateTime = (date) =>
  new Date(date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

const formatVND = (amount) => `${(amount || 0).toLocaleString('vi-VN')}đ`;

const buildHtml = (booking) => `
  <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
    <h2 style="color: #2e7d32;">✅ Đặt chỗ thành công!</h2>
    <p>Cảm ơn bạn đã đặt chỗ gửi xe. Chi tiết booking:</p>
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Biển số xe</b></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.licensePlate}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Loại xe</b></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">Ô tô</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Giờ vào dự kiến</b></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatDateTime(booking.expectedArrivalTime)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Giờ ra dự kiến</b></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${formatDateTime(booking.expectedExitTime)}</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Thời lượng</b></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.durationHours} giờ</td></tr>
      <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><b>Đã thanh toán</b></td>
          <td style="padding: 8px; border-bottom: 1px solid #eee; color: #2e7d32;"><b>${formatVND(booking.amount)}</b></td></tr>
      <tr><td style="padding: 8px;"><b>Mã booking</b></td>
          <td style="padding: 8px;">${booking._id}</td></tr>
    </table>
    <p style="margin-top: 16px; color: #666;">
      ⚠️ Vui lòng đến đúng giờ. Chỗ được giữ đến hết giờ ra dự kiến.
      Nếu đậu quá giờ, phụ phí sẽ thu thêm khi xe ra.
    </p>
    <p style="color: #999; font-size: 12px;">Parking Building Management System</p>
  </div>
`;

// Fire-and-forget — never throws, never blocks the main flow.
export const sendBookingConfirmation = async (booking) => {
  if (!booking?.email) return;
  try {
    await sendEmail({
      to: booking.email,
      subject: `Xác nhận đặt chỗ gửi xe — ${booking.licensePlate}`,
      htmlContent: buildHtml(booking),
    });
    console.log('Booking confirmation email sent', { email: booking.email, bookingId: booking._id });
  } catch (err) {
    console.error('Failed to send booking confirmation email', { error: err.message, email: booking.email });
  }
};
