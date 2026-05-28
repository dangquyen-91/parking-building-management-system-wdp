import mongoose from 'mongoose';

export const PAYMENT_STATUSES = ['pending', 'paid', 'cancelled', 'failed', 'expired'];
export const PAYMENT_PROVIDERS = ['payos'];

const paymentSchema = new mongoose.Schema(
  {
    subscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
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

paymentSchema.index({ subscriptionId: 1 });
paymentSchema.index({ userId: 1, status: 1 });

export default mongoose.model('Payment', paymentSchema);
