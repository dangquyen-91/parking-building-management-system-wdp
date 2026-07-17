export type ComplaintStatus = "open" | "in_progress" | "resolved";

export type ComplaintUser = {
  _id: string;
  fullName?: string;
  email?: string;
  phone?: string;
};

export type ComplaintSlot = {
  _id: string;
  slotCode?: string;
};

export type Complaint = {
  _id: string;
  type: "wrong_slot";
  complainantUserId?: ComplaintUser | string;
  slotId?: ComplaintSlot | string;
  offendingPlate: string;
  offendingUserId?: ComplaintUser | string | null;
  offendingPhone?: string | null;
  offendingSlotCode?: string | null;
  description?: string;
  status: ComplaintStatus;
  handledByStaffId?: ComplaintUser | string | null;
  resolutionNote?: string;
  alertSentTo?: string | null;
  resolvedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
};

export type ComplaintListResult = {
  complaints: Complaint[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
};

export type MyComplaintListResult = {
  complaints: Complaint[];
};

export type CreateComplaintPayload = {
  slotId: string;
  offendingPlate: string;
  description?: string;
};

export type CreateComplaintResult = {
  complaint: Complaint;
  callNow: {
    name?: string;
    phone?: string | null;
    correctSlot?: string | null;
    emailAlerted: boolean;
  } | null;
  note: string;
};
