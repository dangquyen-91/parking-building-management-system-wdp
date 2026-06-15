import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

let transporter = null;

const getTransporter = () => {
  if (transporter) return transporter;
  const { GMAIL_USER, GMAIL_APP_PASSWORD } = process.env;
  if (!GMAIL_USER || !GMAIL_APP_PASSWORD) {
    logger.warn('Email not configured (GMAIL_USER/GMAIL_APP_PASSWORD missing) — emails will be skipped');
    return null;
  }
  transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // STARTTLS on 587 (some hosts block 465)
    auth: { user: GMAIL_USER, pass: GMAIL_APP_PASSWORD },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
  return transporter;
};

const formatDateTime = (date) =>
  new Date(date).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });

const formatVND = (amount) => `${(amount || 0).toLocaleString('vi-VN')}đ`;

// Fire-and-forget — never throws, never blocks the main flow
export const sendBookingConfirmation = async (booking) => {
  const tx = getTransporter();
  if (!tx || !booking?.email) return;

  try {
    await tx.sendMail({
      from: `"Parking Booking" <${process.env.GMAIL_USER}>`,
      to: booking.email,
      subject: `Xác nhận đặt chỗ gửi xe — ${booking.licensePlate}`,
      html: `
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
      `,
    });
    logger.info('Booking confirmation email sent', { email: booking.email, bookingId: booking._id });
  } catch (err) {
    logger.error('Failed to send booking confirmation email', { error: err.message, email: booking.email });
  }
};
