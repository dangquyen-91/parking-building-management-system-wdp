import logger from '../utils/logger.js';

// Brevo (Sendinblue) transactional email over HTTPS — works on hosts that
// block outbound SMTP ports (e.g. Render free tier blocks 465/587).
const BREVO_ENDPOINT = 'https://api.brevo.com/v3/smtp/email';

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
  const { BREVO_API_KEY, BREVO_SENDER_EMAIL } = process.env;
  if (!BREVO_API_KEY || !BREVO_SENDER_EMAIL) {
    logger.warn('Email not configured (BREVO_API_KEY/BREVO_SENDER_EMAIL missing) — emails skipped');
    return;
  }
  if (!booking?.email) return;

  try {
    const res = await fetch(BREVO_ENDPOINT, {
      method: 'POST',
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: process.env.BREVO_SENDER_NAME || 'Parking Booking',
          email: BREVO_SENDER_EMAIL,
        },
        to: [{ email: booking.email }],
        subject: `Xác nhận đặt chỗ gửi xe — ${booking.licensePlate}`,
        htmlContent: buildHtml(booking),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      logger.error('Failed to send booking confirmation email', {
        status: res.status,
        body,
        email: booking.email,
      });
      return;
    }
    logger.info('Booking confirmation email sent', { email: booking.email, bookingId: booking._id });
  } catch (err) {
    logger.error('Failed to send booking confirmation email', { error: err.message, email: booking.email });
  }
};
