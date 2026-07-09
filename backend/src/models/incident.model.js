import mongoose from 'mongoose';

// Operational incidents that staff log for admin/manager visibility.
export const INCIDENT_TYPES = ['lost_qr'];

const incidentSchema = new mongoose.Schema(
  {
    type: { type: String, enum: INCIDENT_TYPES, required: true },
    sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ParkingSession', default: null },
    licensePlate: { type: String, required: true, trim: true, uppercase: true },
    vehicleType: { type: String, enum: ['motorcycle', 'car'] },
    // The staff member who handled the incident.
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    fineAmount: { type: Number, default: 0, min: 0 },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

incidentSchema.index({ type: 1, createdAt: -1 });
incidentSchema.index({ licensePlate: 1 });

export default mongoose.model('Incident', incidentSchema);
