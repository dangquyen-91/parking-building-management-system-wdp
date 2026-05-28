import { randomInt } from 'crypto';
import payOS from '../config/payos.js';
import AppError from '../utils/appError.js';
import logger from '../utils/logger.js';

const PAYMENT_LINK_TTL_SECONDS = 60 * 60;

export const generateOrderCode = () => {
  const epoch = Math.floor(Date.now() / 1000);
  const rand = randomInt(0, 100000);
  return epoch * 100000 + rand;
};

export const createPaymentLink = async ({ orderCode, amount, description, items, buyerName, buyerEmail, buyerPhone }) => {
  try {
    const expiredAt = Math.floor(Date.now() / 1000) + PAYMENT_LINK_TTL_SECONDS;
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
    logger.error('PayOS createPaymentLink failed', { error: err.message, orderCode });
    throw new AppError(`Cannot create payment link: ${err.message}`, 502);
  }
};

export const getPaymentInfo = async (orderCode) => {
  try {
    return await payOS.paymentRequests.get(orderCode);
  } catch (err) {
    logger.error('PayOS getPaymentInfo failed', { error: err.message, orderCode });
    throw new AppError(`Cannot fetch payment info: ${err.message}`, 502);
  }
};

export const cancelPaymentLink = async (orderCode, reason = 'User cancelled') => {
  try {
    return await payOS.paymentRequests.cancel(orderCode, reason);
  } catch (err) {
    logger.error('PayOS cancelPaymentLink failed', { error: err.message, orderCode });
    throw new AppError(`Cannot cancel payment link: ${err.message}`, 502);
  }
};

export const verifyWebhook = async (webhookBody) => {
  try {
    return await payOS.webhooks.verify(webhookBody);
  } catch (err) {
    logger.error('PayOS webhook verification failed', { error: err.message });
    throw new AppError('Invalid webhook signature', 400);
  }
};
