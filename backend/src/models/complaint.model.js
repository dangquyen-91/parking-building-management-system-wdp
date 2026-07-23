import mongoose from 'mongoose';

export const COMPLAINT_TYPES = ['wrong_slot'];
export const COMPLAINT_STATUSES = ['open', 'in_progress', 'resolved'];

const complaintSchema = new mongoose.Schema(
  {
    type: { type: String, enum: COMPLAINT_TYPES, default: 'wrong_slot' },
    // The resident who filed the complaint (owner of the occupied slot).
    complainantUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    slotId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSlot', required: true },
    // The wrongly-parked car and (if a subscriber) its owner B — resolved on create.
    offendingPlate: { type: String, required: true, trim: true, uppercase: true },
    offendingUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    offendingSubscriptionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Subscription', default: null },
    // B's phone, surfaced on create so staff can call immediately (in parallel
    // with the auto-email) instead of waiting for B to read the email.
    offendingPhone: { type: String, default: null },
    offendingSlotCode: { type: String, default: null }, // B's correct slot (e.g. B13)
    description: { type: String, trim: true },
    status: { type: String, enum: COMPLAINT_STATUSES, default: 'open' },
    handledByStaffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    resolutionNote: { type: String, trim: true },
    // Email we auto-sent the move-your-car alert to (audit trail).
    alertSentTo: { type: String, default: null },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

complaintSchema.index({ status: 1, createdAt: -1 });
complaintSchema.index({ complainantUserId: 1, createdAt: -1 });
complaintSchema.index({ offendingPlate: 1 });

export default mongoose.model('Complaint', complaintSchema);
