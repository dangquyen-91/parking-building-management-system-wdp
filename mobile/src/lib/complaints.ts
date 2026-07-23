import { apiRequest } from "./api";
import type {
  Complaint,
  ComplaintListResult,
  ComplaintStatus,
  CreateComplaintPayload,
  CreateComplaintResult,
  MyComplaintListResult,
} from "@/types/complaints";

export const complaintKeys = {
  all: ["complaints"] as const,
  staff: ["complaints", "staff"] as const,
  staffList: (status: ComplaintStatus | "all" = "all") =>
    ["complaints", "staff", "list", status] as const,
  mine: ["complaints", "mine"] as const,
  mineList: (status: ComplaintStatus | "all" = "all") =>
    ["complaints", "mine", "list", status] as const,
};

export const getAllComplaints = (params?: {
  status?: ComplaintStatus;
  page?: number;
  limit?: number;
}) => apiRequest<ComplaintListResult>("/complaints", { params });

export const getMyComplaints = (params?: {
  status?: ComplaintStatus;
}) => apiRequest<MyComplaintListResult>("/complaints/me", { params });

export const createComplaint = (payload: CreateComplaintPayload) =>
  apiRequest<CreateComplaintResult>("/complaints", {
    method: "POST",
    data: {
      ...payload,
      description: payload.description?.trim() || undefined,
      offendingPlate: payload.offendingPlate.trim().toUpperCase(),
    },
  });

export const updateComplaintStatus = ({
  id,
  resolutionNote,
  status,
}: {
  id: string;
  status: ComplaintStatus;
  resolutionNote?: string;
}) =>
  apiRequest<{ complaint: Complaint }>(`/complaints/${id}/status`, {
    method: "PATCH",
    data: {
      resolutionNote,
      status,
    },
  }).then((result) => result.complaint);
