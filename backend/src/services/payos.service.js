import { randomInt } from 'crypto';
import payOS from '../config/payos.js';
import AppError from '../utils/appError.js';

const PAYMENT_LINK_TTL_SECONDS = 60 * 60;

export const generateOrderCode = () => {
  const epoch = Math.floor(Date.now() / 1000);
  const rand = randomInt(0, 100000);
  return epoch * 100000 + rand;
};

export const createPaymentLink = async ({ orderCode, amount, description, items, buyerName, buyerEmail, buyerPhone, expiresInSeconds }) => {
  try {
    // Expire the link no later than when the order's pending window closes, so a
    // customer can't pay after the order was auto-cancelled (money with no order).
    const ttl = expiresInSeconds && expiresInSeconds > 0 ? expiresInSeconds : PAYMENT_LINK_TTL_SECONDS;
    const expiredAt = Math.floor(Date.now() / 1000) + ttl;
    const result = await payOS.paymentRequests.create({
      orderCode,
      amount,
      description: description.slice(0, 25),
      cancelUrl: process.env.PAYOS_CANCEL_URL,
      returnUrl: process.env.PAYOS_RETURN_URL,
      items,
      buyerName,
      buyerEmail,
      buyerPhone,
      expiredAt,
    });
    return result;
  } catch (err) {
    console.error('PayOS createPaymentLink failed', { error: err.message, orderCode });
    throw new AppError(`Cannot create payment link: ${err.message}`, 502);
  }
};

export const getPaymentInfo = async (orderCode) => {
  try {
    return await payOS.paymentRequests.get(orderCode);
  } catch (err) {
    console.error('PayOS getPaymentInfo failed', { error: err.message, orderCode });
    throw new AppError(`Cannot fetch payment info: ${err.message}`, 502);
  }
};

export const cancelPaymentLink = async (orderCode, reason = 'User cancelled') => {
  try {
    return await payOS.paymentRequests.cancel(orderCode, reason);
  } catch (err) {
    console.error('PayOS cancelPaymentLink failed', { error: err.message, orderCode });
    throw new AppError(`Cannot cancel payment link: ${err.message}`, 502);
  }
};

export const verifyWebhook = async (webhookBody) => {
  try {
    return await payOS.webhooks.verify(webhookBody);
  } catch (err) {
    console.error('PayOS webhook verification failed', { error: err.message });
    throw new AppError('Invalid webhook signature', 400);
  }
};
