import Complaint from '../models/complaint.model.js';
import Subscription from '../models/subscription.model.js';
import ParkingSlot from '../models/parking-slot.model.js';
import * as emailService from './email.service.js';
import AppError from '../utils/appError.js';

const COMPLAINT_POPULATE = [
  { path: 'complainantUserId', select: 'fullName email phone' },
  { path: 'offendingUserId', select: 'fullName email phone' },
  { path: 'slotId', select: 'slotCode' },
  { path: 'handledByStaffId', select: 'fullName email' },
];

export const create = async ({ userId, slotId, offendingPlate, description }) => {
  const normalizedPlate = offendingPlate.toUpperCase().replace(/\s/g, '');

  // The complainant must actually own this slot via an active subscription.
  const ownSub = await Subscription.findOne({ userId, slotId, status: 'active' });
  if (!ownSub) {
    throw new AppError('Bạn không sở hữu chỗ đỗ này (cần gói đang hoạt động gắn với chỗ đó).', 403);
  }

  const slot = await ParkingSlot.findById(slotId).select('slotCode');
  if (!slot) throw new AppError('Parking slot not found', 404);

  // Resolve the wrongly-parked car's owner B (if a subscriber) → contact + correct slot.
  const offendingSub = await Subscription.findOne({ licensePlate: normalizedPlate, status: 'active' })
    .populate('userId', 'fullName email phone')
    .populate('slotId', 'slotCode');

  const offendingUser = offendingSub?.userId || null;
  const correctSlotCode = offendingSub?.slotId?.slotCode || null;

  const complaint = await Complaint.create({
    type: 'wrong_slot',
    complainantUserId: userId,
    slotId,
    offendingPlate: normalizedPlate,
    offendingUserId: offendingUser?._id || null,
    offendingSubscriptionId: offendingSub?._id || null,
    offendingPhone: offendingUser?.phone || null,
    offendingSlotCode: correctSlotCode,
    description: description?.trim(),
    status: 'open',
    alertSentTo: offendingUser?.email || null,
  });

  // Parallel response: (1) auto-email B, (2) hand B's phone to staff to call now.
  if (offendingUser?.email) {
    emailService.sendWrongSlotAlert({
      email: offendingUser.email,
      name: offendingUser.fullName,
      plate: normalizedPlate,
      occupiedSlot: slot.slotCode,
      correctSlot: correctSlotCode,
    });
  }

  const populated = await complaint.populate(COMPLAINT_POPULATE);
  return {
    complaint: populated,
    // Surfaced so staff can ring B immediately, without waiting for the email.
    callNow: offendingUser
      ? {
          name: offendingUser.fullName,
          phone: offendingUser.phone || null,
          correctSlot: correctSlotCode,
          emailAlerted: !!offendingUser.email,
        }
      : null,
    note: offendingUser
      ? 'Đã gửi email cảnh báo cho chủ xe. Nhân viên gọi ngay số bên dưới để xử lý song song.'
      : 'Không tìm thấy chủ xe trong hệ thống (xe không có gói). Nhân viên xử lý thủ công.',
  };
};

export const getAll = async ({ page = 1, limit = 20, status } = {}) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const filter = {};
  if (status) filter.status = status;

  const skip = (pageNum - 1) * limitNum;
  const [complaints, total] = await Promise.all([
    Complaint.find(filter).populate(COMPLAINT_POPULATE).skip(skip).limit(limitNum).sort({ createdAt: -1 }),
    Complaint.countDocuments(filter),
  ]);
  return { complaints, total, page: pageNum, limit: limitNum, totalPages: Math.ceil(total / limitNum) };
};

export const getMine = async (userId, { status } = {}) => {
  const filter = { complainantUserId: userId };
  if (status) filter.status = status;
  return Complaint.find(filter).populate(COMPLAINT_POPULATE).sort({ createdAt: -1 });
};

export const getById = async (id) => {
  const complaint = await Complaint.findById(id).populate(COMPLAINT_POPULATE);
  if (!complaint) throw new AppError('Complaint not found', 404);
  return complaint;
};

export const updateStatus = async (id, { status, resolutionNote }, staffId) => {
  const complaint = await Complaint.findById(id);
  if (!complaint) throw new AppError('Complaint not found', 404);

  complaint.status = status;
  complaint.handledByStaffId = staffId;
  if (resolutionNote !== undefined) complaint.resolutionNote = resolutionNote;
  if (status === 'resolved') complaint.resolvedAt = new Date();

  await complaint.save();
  return complaint.populate(COMPLAINT_POPULATE);
};
