import { z } from "zod";

export const complaintStatusSchema = z.enum(["open", "in_progress", "resolved"]);

export const createComplaintPayloadSchema = z.object({
  slotId: z.string().trim().min(1, "Vui lòng chọn chỗ cư dân bị chiếm."),
  offendingPlate: z
    .string()
    .trim()
    .min(4, "Vui lòng nhập biển số xe vi phạm từ 4 ký tự trở lên.")
    .max(20, "Biển số xe vi phạm không được vượt quá 20 ký tự."),
  description: z
    .string()
    .trim()
    .max(500, "Mô tả sự việc không được vượt quá 500 ký tự.")
    .optional(),
});
