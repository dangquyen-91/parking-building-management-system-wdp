import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  complaintKeys,
  createComplaint,
  getAllComplaints,
  getMyComplaints,
  updateComplaintStatus,
} from "@/lib/complaints";
import type { ComplaintStatus } from "@/types/complaints";

export const useAllComplaintsQuery = (
  statusFilter: ComplaintStatus | "all",
  enabled: boolean,
) =>
  useQuery({
    queryKey: complaintKeys.staffList(statusFilter),
    queryFn: () =>
      getAllComplaints({
        limit: 100,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
    enabled,
  });

export const useMyComplaintsQuery = (
  statusFilter: ComplaintStatus | "all",
  enabled: boolean,
) =>
  useQuery({
    queryKey: complaintKeys.mineList(statusFilter),
    queryFn: () =>
      getMyComplaints({
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
    enabled,
  });

export const useCreateComplaintMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComplaint,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintKeys.mine });
      queryClient.invalidateQueries({ queryKey: complaintKeys.staff });
    },
  });
};

export const useUpdateComplaintStatusMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateComplaintStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: complaintKeys.staff });
      queryClient.invalidateQueries({ queryKey: complaintKeys.mine });
    },
  });
};
