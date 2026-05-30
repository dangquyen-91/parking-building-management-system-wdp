import mongoose from 'mongoose';

export const PAYMENT_STATUSES = ['pending', 'paid', 'cancelled', 'failed', 'expired'];
export const PAYMENT_PROVIDERS = ['payos'];
export const PAYMENT_TARGET_TYPES = ['subscription', 'session'];

const paymentSchema = new mongoose.Schema(
  {
    targetType: { type: String, enum: PAYMENT_TARGET_TYPES, required: true },
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSession', default: null },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    provider: { type: String, enum: PAYMENT_PROVIDERS, default: 'payos' },
    orderCode: { type: Number, required: true, unique: true },
    amount: { type: Number, required: true, min: 0 },
    currency: { type: String, default: 'VND' },
    description: { type: String, trim: true },
    status: { type: String, enum: PAYMENT_STATUSES, default: 'pending' },
    checkoutUrl: { type: String },
    paymentLinkId: { type: String },
    paidAt: { type: Date },
    providerData: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

paymentSchema.pre('validate', function (next) {
  if (this.targetType === 'subscription' && !this.subscriptionId) {
    return next(new Error('subscriptionId is required when targetType=subscription'));
  }
  if (this.targetType === 'session' && !this.sessionId) {
    return next(new Error('sessionId is required when targetType=session'));
  }
  next();
});

paymentSchema.index({ subscriptionId: 1 });
paymentSchema.index({ sessionId: 1 });
paymentSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Payment', paymentSchema);
