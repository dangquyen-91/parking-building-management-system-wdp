import { Linking } from "react-native";
import { useMemo, useState } from "react";
import { toast } from "sonner-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { GlassCard, Label, Page, Stat } from "@/components/parking-ui";
import { useCurrentUserQuery } from "@/hooks/useAuth";
import {
  useAllComplaintsQuery,
  useUpdateComplaintStatusMutation,
} from "@/hooks/useComplaints";
import { isStaffRole } from "@/lib/role-navigation";
import type {
  Complaint,
  ComplaintStatus,
  ComplaintUser,
} from "@/types/complaints";
import { formatDateTimeWithYear } from "@/utils/format";
import { Pressable, ScrollView, Text, View, useThemeColors } from "@/tw";

const statusFilters: Array<{
  label: string;
  value: ComplaintStatus | "all";
}> = [
  { label: "Tất cả", value: "all" },
  { label: "Mới gửi", value: "open" },
  { label: "Đang xử lý", value: "in_progress" },
  { label: "Đã xử lý", value: "resolved" },
];

const statusLabels: Record<ComplaintStatus, string> = {
  open: "Mới gửi",
  in_progress: "Đang xử lý",
  resolved: "Đã xử lý",
};

const statusToneClassNames: Record<ComplaintStatus, string> = {
  open: "border border-amber-400/40 bg-amber-500/15 text-amber-200",
  in_progress: "border border-sky-400/40 bg-sky-500/15 text-sky-200",
  resolved: "border border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
};

const getComplaintUserName = (value?: ComplaintUser | string | null) => {
  if (!value || typeof value === "string") {
    return "Chưa xác định";
  }

  return value.fullName ?? value.email ?? value.phone ?? "Chưa xác định";
};

const getComplaintUserPhone = (value?: ComplaintUser | string | null) => {
  if (!value || typeof value === "string") {
    return undefined;
  }

  return value.phone ?? undefined;
};

const getComplaintSlotCode = (complaint: Complaint) => {
  const slot = complaint.slotId;

  if (!slot || typeof slot === "string") {
    return "Không rõ";
  }

  return slot.slotCode ?? "Không rõ";
};

const getResolutionNote = (status: ComplaintStatus) =>
  status === "in_progress"
    ? "Nhân viên đã tiếp nhận và đang liên hệ chủ xe."
    : "Đã xác nhận xử lý xong khiếu nại đỗ sai chỗ.";

const InfoItem = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => (
  <View className="gap-1">
    <Text className="font-sans text-xs font-bold uppercase text-faint">
      {label}
    </Text>
    <Text selectable className="font-sans text-sm font-bold leading-5 text-fg">
      {value}
    </Text>
  </View>
);

export default function StaffOperations() {
  const { btnPrimaryFg } = useThemeColors();
  const { data: currentUser } = useCurrentUserQuery();
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
  const complaintsQuery = useAllComplaintsQuery(statusFilter, isStaffRole(currentUser?.role));
  const updateStatusMutation = useUpdateComplaintStatusMutation();

  const complaints = complaintsQuery.data?.complaints ?? [];

  const stats = useMemo(
    () => ({
      open: complaints.filter((item) => item.status === "open").length.toString(),
      inProgress: complaints
        .filter((item) => item.status === "in_progress")
        .length.toString(),
      resolved: complaints.filter((item) => item.status === "resolved").length.toString(),
    }),
    [complaints],
  );

  const handleRefresh = async () => {
    const result = await complaintsQuery.refetch();

    if (result.error) {
      toast.error("Không thể làm mới", {
        description:
          result.error instanceof Error
            ? result.error.message
            : "Không thể tải danh sách khiếu nại lúc này.",
      });
      return;
    }

    toast.success("Đã làm mới danh sách khiếu nại");
  };

  const handleCall = async (phone?: string | null) => {
    if (!phone) {
      toast.info("Chưa có số điện thoại", {
        description: "Chủ xe này chưa có số điện thoại để staff gọi nhanh.",
      });
      return;
    }

    try {
      await Linking.openURL(`tel:${phone}`);
    } catch (error) {
      toast.error("Không thể mở cuộc gọi", {
        description:
          error instanceof Error
            ? error.message
            : "Thiết bị chưa hỗ trợ thao tác gọi từ ứng dụng.",
      });
    }
  };

  const handleUpdateStatus = async (
    complaint: Complaint,
    status: ComplaintStatus,
  ) => {
    try {
      await updateStatusMutation.mutateAsync({
        id: complaint._id,
        resolutionNote: getResolutionNote(status),
        status,
      });

      toast.success(`Đã cập nhật ${complaint.offendingPlate}`, {
        description: `Trạng thái hiện tại: ${statusLabels[status]}.`,
      });
    } catch (error) {
      toast.error("Cập nhật thất bại", {
        description:
          error instanceof Error
            ? error.message
            : "Không thể cập nhật trạng thái khiếu nại.",
      });
    }
  };

  return (
    <Page
      eyebrow="Staff complaints"
      title="Khiếu nại đỗ sai chỗ"
      subtitle="Thay cho màn staff operation: staff theo dõi xe đỗ sai chỗ, gọi đúng chủ xe và cập nhật xử lý ngay trên điện thoại."
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-5 pb-[120px]"
      >
        <View className="flex-row gap-3">
          <Stat label="Mới gửi" value={stats.open} />
          <Stat label="Đang xử lý" value={stats.inProgress} />
          <Stat label="Đã xử lý" value={stats.resolved} />
        </View>

        <GlassCard className="gap-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-1">
              <Label>Bộ lọc ca trực</Label>
              <Text className="font-sans text-lg font-extrabold text-fg">
                Xem nhanh khiếu nại cần staff xử lý
              </Text>
              <Text className="font-sans text-sm leading-5 text-subtle">
                Ưu tiên các case mới gửi để gọi chủ xe di chuyển ngay.
              </Text>
            </View>

            <Pressable
              className="rounded-full bg-btn-primary px-4 py-2.5"
              disabled={complaintsQuery.isFetching}
              onPress={() => void handleRefresh()}
            >
              <Text className="font-sans text-sm font-bold text-btn-primary-fg">
                {complaintsQuery.isFetching ? "Đang tải..." : "Tải lại"}
              </Text>
            </Pressable>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {statusFilters.map((filter) => {
                const isSelected = statusFilter === filter.value;

                return (
                  <Pressable
                    key={filter.value}
                    className={`rounded-full px-4 py-2 ${
                      isSelected
                        ? "bg-btn-primary"
                        : "border border-border-theme bg-badge"
                    }`}
                    onPress={() => setStatusFilter(filter.value)}
                  >
                    <Text
                      className={`font-sans text-sm font-bold ${
                        isSelected ? "text-btn-primary-fg" : "text-fg"
                      }`}
                    >
                      {filter.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </GlassCard>

        {complaintsQuery.isLoading ? (
          <GlassCard className="gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-btn-primary">
              <Ionicons name="sync-outline" color={btnPrimaryFg} size={22} />
            </View>
            <Text className="font-sans text-base font-extrabold text-fg">
              Đang tải khiếu nại...
            </Text>
            <Text className="font-sans text-sm leading-5 text-subtle">
              Danh sách complaint sẽ xuất hiện ngay khi máy chủ phản hồi.
            </Text>
          </GlassCard>
        ) : complaintsQuery.error ? (
          <GlassCard className="gap-2">
            <Label>Lỗi tải dữ liệu</Label>
            <Text selectable className="font-sans text-sm leading-5 text-fg">
              {complaintsQuery.error instanceof Error
                ? complaintsQuery.error.message
                : "Không thể tải danh sách khiếu nại."}
            </Text>
          </GlassCard>
        ) : complaints.length === 0 ? (
          <GlassCard className="gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-btn-primary">
              <Ionicons name="checkmark-done-outline" color={btnPrimaryFg} size={22} />
            </View>
            <Text className="font-sans text-lg font-extrabold text-fg">
              Chưa có khiếu nại phù hợp
            </Text>
            <Text className="font-sans text-sm leading-5 text-subtle">
              Khi cư dân báo xe đỗ sai chỗ, biển số, số điện thoại và slot đúng sẽ hiện ở đây để staff xử lý.
            </Text>
          </GlassCard>
        ) : (
          complaints.map((complaint) => {
            const offenderPhone =
              complaint.offendingPhone ??
              getComplaintUserPhone(complaint.offendingUserId) ??
              null;
            const isUpdating =
              updateStatusMutation.isPending &&
              updateStatusMutation.variables?.id === complaint._id;

            return (
              <GlassCard key={complaint._id} className="gap-4">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 gap-2">
                    <Label>Khiếu nại mới</Label>
                    <Text selectable className="font-sans text-2xl font-extrabold text-fg">
                      {complaint.offendingPlate}
                    </Text>
                    <Text className="font-sans text-sm leading-5 text-subtle">
                      Gửi lúc {formatDateTimeWithYear(complaint.createdAt)}
                    </Text>
                  </View>

                  <View
                    className={`rounded-full px-3 py-1.5 ${statusToneClassNames[complaint.status]}`}
                  >
                    <Text className="font-sans text-xs font-bold uppercase">
                      {statusLabels[complaint.status]}
                    </Text>
                  </View>
                </View>

                <View className="gap-3 rounded-[14px] bg-surface-alt p-3">
                  <InfoItem label="Ô bị chiếm" value={getComplaintSlotCode(complaint)} />
                  <InfoItem
                    label="Ô đúng của chủ xe"
                    value={complaint.offendingSlotCode || "Chưa xác định"}
                  />
                  <InfoItem
                    label="Cư dân báo cáo"
                    value={getComplaintUserName(complaint.complainantUserId)}
                  />
                  <InfoItem
                    label="Chủ xe đỗ sai"
                    value={getComplaintUserName(complaint.offendingUserId)}
                  />
                  <InfoItem
                    label="Số điện thoại"
                    value={offenderPhone || "Chưa có số liên hệ"}
                  />
                  <InfoItem
                    label="Email đã cảnh báo"
                    value={complaint.alertSentTo || "Chưa gửi hoặc không có email"}
                  />
                  {complaint.description ? (
                    <InfoItem label="Ghi chú cư dân" value={complaint.description} />
                  ) : null}
                  {complaint.resolutionNote ? (
                    <InfoItem label="Ghi chú xử lý" value={complaint.resolutionNote} />
                  ) : null}
                </View>

                <View className="gap-2">
                  <Pressable
                    className="items-center rounded-full bg-btn-primary py-3.5"
                    onPress={() => void handleCall(offenderPhone)}
                  >
                    <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                      Gọi chủ xe
                    </Text>
                  </Pressable>

                  {complaint.status === "open" ? (
                    <Pressable
                      className="items-center rounded-full border border-border-theme bg-badge py-3.5"
                      disabled={isUpdating}
                      onPress={() => void handleUpdateStatus(complaint, "in_progress")}
                    >
                      <Text className="font-sans text-base font-extrabold text-fg">
                        {isUpdating ? "Đang cập nhật..." : "Nhận xử lý"}
                      </Text>
                    </Pressable>
                  ) : null}

                  {complaint.status !== "resolved" ? (
                    <Pressable
                      className="items-center rounded-full border border-border-theme bg-badge py-3.5"
                      disabled={isUpdating}
                      onPress={() => void handleUpdateStatus(complaint, "resolved")}
                    >
                      <Text className="font-sans text-base font-extrabold text-fg">
                        {isUpdating ? "Đang cập nhật..." : "Đánh dấu đã xử lý"}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              </GlassCard>
            );
          })
        )}
      </ScrollView>
    </Page>
  );
}
