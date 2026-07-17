import { useEffect, useMemo, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";

import { AppRefreshControl } from "@/components/common/refresh-control";
import { GlassCard, Label, Page } from "@/components/parking-ui";
import { useCreateComplaintMutation, useMyComplaintsQuery } from "@/hooks/useComplaints";
import { useCurrentUserQuery } from "@/hooks/useAuth";
import { useMySubscriptionsQuery } from "@/hooks/useSubscriptions";
import { createComplaintPayloadSchema } from "@/schema";
import type { Subscription } from "@/types/subscriptions";
import type { Complaint, ComplaintStatus, CreateComplaintResult } from "@/types/complaints";
import {
  formatComplaintStatus,
  formatDate,
  formatDateTimeWithYear,
} from "@/utils/format";
import { getFieldErrors } from "@/utils/validation";
import { Link, Pressable, ScrollView, Text, TextInput, View, useThemeColors } from "@/tw";

type ComplaintField = "slotId" | "offendingPlate" | "description";

const statusFilters: Array<{
  label: string;
  value: ComplaintStatus | "all";
}> = [
  { label: "Tất cả", value: "all" },
  { label: "Mới gửi", value: "open" },
  { label: "Đang xử lý", value: "in_progress" },
  { label: "Đã xử lý", value: "resolved" },
];

const statusToneClassNames: Record<ComplaintStatus, string> = {
  open: "border border-amber-400/40 bg-amber-500/15 text-amber-200",
  in_progress: "border border-sky-400/40 bg-sky-500/15 text-sky-200",
  resolved: "border border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
};

const inputStyle = {
  paddingHorizontal: 16,
  paddingVertical: 14,
};

const getComplaintSlotCode = (complaint: Complaint) => {
  if (!complaint.slotId || typeof complaint.slotId === "string") {
    return "Không rõ";
  }

  return complaint.slotId.slotCode ?? "Không rõ";
};

const getHandledByName = (complaint: Complaint) => {
  if (!complaint.handledByStaffId || typeof complaint.handledByStaffId === "string") {
    return null;
  }

  return complaint.handledByStaffId.fullName ?? complaint.handledByStaffId.email ?? null;
};

const getResidentSubscriptions = (subscriptions: Subscription[] | undefined) =>
  (subscriptions ?? []).filter(
    (item): item is Subscription & { slotId: NonNullable<Subscription["slotId"]> } =>
      item.status === "active" && Boolean(item.slotId?._id && item.slotId.slotCode),
  );

const ComplaintAuthCard = ({ iconColor }: { iconColor: string }) => (
  <GlassCard className="gap-4">
    <View className="h-12 w-12 items-center justify-center rounded-full bg-badge">
      <Ionicons name="chatbubble-ellipses-outline" color={iconColor} size={22} />
    </View>
    <View className="gap-1">
      <Text className="font-sans text-xl font-extrabold text-fg">Cần đăng nhập</Text>
      <Text className="font-sans text-sm leading-5 text-subtle">
        Đăng nhập để gửi khiếu nại về xe đỗ sai chỗ và theo dõi staff xử lý.
      </Text>
    </View>
    <Link href="/(auth)/login" asChild>
      <Pressable className="items-center rounded-full bg-btn-primary py-4">
        <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
          Đăng nhập
        </Text>
      </Pressable>
    </Link>
  </GlassCard>
);

export function ComplaintScreen() {
  const { btnPrimaryFg, iconPrimary, placeholder } = useThemeColors();
  const [statusFilter, setStatusFilter] = useState<ComplaintStatus | "all">("all");
  const [selectedSubscriptionId, setSelectedSubscriptionId] = useState<string | null>(null);
  const [offendingPlate, setOffendingPlate] = useState("");
  const [description, setDescription] = useState("");
  const [errors, setErrors] = useState<Partial<Record<ComplaintField, string>>>({});
  const [latestResult, setLatestResult] = useState<CreateComplaintResult | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: currentUser } = useCurrentUserQuery();
  const subscriptionsQuery = useMySubscriptionsQuery(Boolean(currentUser));
  const complaintsQuery = useMyComplaintsQuery(statusFilter, Boolean(currentUser));
  const createComplaintMutation = useCreateComplaintMutation();

  const residentSubscriptions = useMemo(
    () => getResidentSubscriptions(subscriptionsQuery.data?.subscriptions),
    [subscriptionsQuery.data?.subscriptions],
  );

  useEffect(() => {
    if (residentSubscriptions.length === 0) {
      setSelectedSubscriptionId(null);
      return;
    }

    const hasSelectedSubscription = residentSubscriptions.some(
      (item) => item._id === selectedSubscriptionId,
    );

    if (!hasSelectedSubscription) {
      setSelectedSubscriptionId(residentSubscriptions[0]._id);
    }
  }, [residentSubscriptions, selectedSubscriptionId]);

  const selectedSubscription =
    residentSubscriptions.find((item) => item._id === selectedSubscriptionId) ?? null;
  const complaints = complaintsQuery.data?.complaints ?? [];

  const handleCreateComplaint = async () => {
    const validation = createComplaintPayloadSchema.safeParse({
      slotId: selectedSubscription?.slotId?._id ?? "",
      offendingPlate: offendingPlate.trim().toUpperCase(),
      description: description.trim() || undefined,
    });

    if (!validation.success) {
      setErrors(getFieldErrors<ComplaintField>(validation.error));
      return;
    }

    setErrors({});

    try {
      const result = await createComplaintMutation.mutateAsync(validation.data);
      setLatestResult(result);
      setOffendingPlate("");
      setDescription("");

      toast.success("Đã gửi khiếu nại", {
        description: "Staff sẽ tiếp nhận và xử lý xe đỗ sai chỗ sớm nhất có thể.",
      });
    } catch (error) {
      toast.error("Gửi khiếu nại thất bại", {
        description:
          error instanceof Error ? error.message : "Không thể gửi khiếu nại lúc này.",
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      const results = await Promise.all([
        subscriptionsQuery.refetch(),
        complaintsQuery.refetch(),
      ]);

      if (results.every((result) => result.isSuccess)) {
        toast.success("Đã làm mới màn khiếu nại");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  if (!currentUser) {
    return (
      <Page
        eyebrow="Khiếu nại"
        title="Báo xe đỗ sai chỗ"
        subtitle="Gửi nhanh phản ánh khi xe khác đang chiếm chỗ cư dân của bạn."
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-4 px-5 pb-[120px]"
        >
          <ComplaintAuthCard iconColor={iconPrimary} />
        </ScrollView>
      </Page>
    );
  }

  return (
    <Page
      eyebrow="Khiếu nại"
      title="Báo xe đỗ sai chỗ"
      subtitle="Chọn đúng chỗ cư dân đang bị chiếm, nhập biển số xe vi phạm và theo dõi staff xử lý ngay trên điện thoại."
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-5 pb-[120px]"
        refreshControl={
          <AppRefreshControl onRefresh={handleRefresh} refreshing={isRefreshing} />
        }
      >
        <GlassCard className="gap-4">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-btn-primary">
              <Ionicons name="warning-outline" color={btnPrimaryFg} size={22} />
            </View>
            <View className="flex-1 gap-1">
              <Text className="font-sans text-lg font-extrabold text-fg">
                Gửi phản ánh cho staff
              </Text>
              <Text className="font-sans text-sm leading-5 text-subtle">
                Dùng khi có xe khác đang đỗ nhầm vào chỗ cư dân đã gắn với gói của bạn.
              </Text>
            </View>
          </View>

          {residentSubscriptions.length === 0 ? (
            <View className="gap-2 rounded-[14px] bg-surface-alt p-3">
              <Text className="font-sans text-base font-extrabold text-fg">
                Chưa có chỗ cư dân đủ điều kiện để báo
              </Text>
              <Text className="font-sans text-sm leading-5 text-subtle">
                Bạn cần một gói cư dân đang hoạt động và đã gắn chỗ đỗ cố định trước khi gửi khiếu nại.
              </Text>
            </View>
          ) : (
            <View className="gap-3">
              <View className="gap-2">
                <Label>Chọn chỗ cư dân bị chiếm</Label>
                <View className="gap-2">
                  {residentSubscriptions.map((subscription) => {
                    const isSelected = subscription._id === selectedSubscription?._id;

                    return (
                      <Pressable
                        key={subscription._id}
                        className={`rounded-[18px] border px-4 py-4 ${
                          isSelected
                            ? "border-btn-primary bg-btn-primary"
                            : "border-border-theme bg-glass-card"
                        }`}
                        onPress={() => {
                          setSelectedSubscriptionId(subscription._id);
                          setErrors((current) => ({ ...current, slotId: undefined }));
                        }}
                      >
                        <View className="flex-row items-start justify-between gap-3">
                          <View className="flex-1 gap-1">
                            <Text
                              className={`font-sans text-base font-extrabold ${
                                isSelected ? "text-btn-primary-fg" : "text-fg"
                              }`}
                            >
                              {subscription.slotId.slotCode}
                            </Text>
                            <Text
                              className={`font-sans text-sm ${
                                isSelected ? "text-btn-primary-fg" : "text-subtle"
                              }`}
                            >
                              {subscription.licensePlate} - {subscription.planId.name}
                            </Text>
                            <Text
                              className={`font-sans text-xs ${
                                isSelected ? "text-btn-primary-fg" : "text-subtle"
                              }`}
                            >
                              Có hiệu lực đến {formatDate(subscription.endDate)}
                            </Text>
                          </View>
                          {isSelected ? (
                            <Ionicons name="checkmark-circle" color={btnPrimaryFg} size={20} />
                          ) : null}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
                {errors.slotId ? (
                  <Text className="font-sans text-sm text-red-400">{errors.slotId}</Text>
                ) : null}
              </View>

              <View className="gap-2">
                <Label>Biển số xe vi phạm</Label>
                <TextInput
                  autoCapitalize="characters"
                  className="rounded-[14px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
                  onChangeText={(value) => {
                    setOffendingPlate(value);
                    setErrors((current) => ({ ...current, offendingPlate: undefined }));
                  }}
                  placeholder="59A12345"
                  placeholderTextColor={placeholder}
                  style={inputStyle}
                  value={offendingPlate}
                />
                {errors.offendingPlate ? (
                  <Text className="font-sans text-sm text-red-400">
                    {errors.offendingPlate}
                  </Text>
                ) : null}
              </View>

              <View className="gap-2">
                <Label>Mô tả thêm</Label>
                <TextInput
                  className="min-h-[120px] rounded-[14px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
                  multiline
                  onChangeText={(value) => {
                    setDescription(value);
                    setErrors((current) => ({ ...current, description: undefined }));
                  }}
                  placeholder="Ví dụ: xe đỗ chắn lối ra từ 19:30, tôi đã kiểm tra lại biển số trên app."
                  placeholderTextColor={placeholder}
                  style={inputStyle}
                  textAlignVertical="top"
                  value={description}
                />
                <View className="flex-row items-center justify-between gap-3">
                  {errors.description ? (
                    <Text className="font-sans text-sm text-red-400">{errors.description}</Text>
                  ) : (
                    <Text className="font-sans text-xs text-subtle">
                      Có thể bỏ trống nếu chỉ cần báo nhanh biển số xe vi phạm.
                    </Text>
                  )}
                  <Text className="font-sans text-xs text-subtle">
                    {description.trim().length}/500
                  </Text>
                </View>
              </View>

              <Pressable
                className="items-center rounded-full bg-btn-primary py-4"
                disabled={createComplaintMutation.isPending || !selectedSubscription}
                onPress={() => void handleCreateComplaint()}
              >
                <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                  {createComplaintMutation.isPending ? "Đang gửi khiếu nại..." : "Gửi khiếu nại"}
                </Text>
              </Pressable>
            </View>
          )}
        </GlassCard>

        {latestResult ? (
          <GlassCard className="gap-3">
            <Label>Phản hồi gần nhất</Label>
            <Text className="font-sans text-lg font-extrabold text-fg">
              Khiếu nại đã được ghi nhận
            </Text>
            <Text className="font-sans text-sm leading-5 text-subtle">
              {latestResult.note}
            </Text>
            <View className="gap-2 rounded-[14px] bg-surface-alt p-3">
              <Text selectable className="font-sans text-sm font-bold text-fg">
                Biển số vi phạm: {latestResult.complaint.offendingPlate}
              </Text>
              <Text className="font-sans text-sm text-subtle">
                Chỗ cư dân: {getComplaintSlotCode(latestResult.complaint)}
              </Text>
              {latestResult.callNow?.correctSlot ? (
                <Text className="font-sans text-sm text-subtle">
                  Hệ thống đã xác định chỗ đúng của xe này là {latestResult.callNow.correctSlot}.
                </Text>
              ) : null}
            </View>
          </GlassCard>
        ) : null}

        <GlassCard className="gap-4">
          <View className="flex-row items-center justify-between gap-3">
            <View className="gap-1">
              <Label>Lịch sử của bạn</Label>
              <Text className="font-sans text-lg font-extrabold text-fg">
                Theo dõi staff xử lý
              </Text>
            </View>
            <View className="rounded-full bg-badge px-3 py-1.5">
              <Text className="font-sans text-xs font-bold uppercase text-fg">
                {complaints.length} mục
              </Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View className="flex-row gap-2">
              {statusFilters.map((filter) => {
                const isSelected = statusFilter === filter.value;

                return (
                  <Pressable
                    key={filter.value}
                    className={`rounded-full px-4 py-2 ${
                      isSelected ? "bg-btn-primary" : "border border-border-theme bg-badge"
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
              Đang tải lịch sử khiếu nại...
            </Text>
            <Text className="font-sans text-sm leading-5 text-subtle">
              Các phản ánh bạn đã gửi sẽ xuất hiện tại đây ngay khi máy chủ phản hồi.
            </Text>
          </GlassCard>
        ) : complaintsQuery.error ? (
          <GlassCard className="gap-2">
            <Label>Lỗi tải dữ liệu</Label>
            <Text selectable className="font-sans text-sm leading-5 text-fg">
              {complaintsQuery.error instanceof Error
                ? complaintsQuery.error.message
                : "Không thể tải lịch sử khiếu nại của bạn."}
            </Text>
          </GlassCard>
        ) : complaints.length === 0 ? (
          <GlassCard className="gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-btn-primary">
              <Ionicons name="checkmark-done-outline" color={btnPrimaryFg} size={22} />
            </View>
            <Text className="font-sans text-lg font-extrabold text-fg">
              Chưa có khiếu nại nào
            </Text>
            <Text className="font-sans text-sm leading-5 text-subtle">
              Khi bạn báo xe đỗ sai chỗ, staff sẽ cập nhật tiến độ xử lý trực tiếp tại màn này.
            </Text>
          </GlassCard>
        ) : (
          complaints.map((complaint) => (
            <GlassCard key={complaint._id} className="gap-4">
              <View className="flex-row items-start justify-between gap-3">
                <View className="flex-1 gap-1">
                  <Label>Khiếu nại</Label>
                  <Text selectable className="font-sans text-xl font-extrabold text-fg">
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
                    {formatComplaintStatus(complaint.status)}
                  </Text>
                </View>
              </View>

              <View className="gap-3 rounded-[14px] bg-surface-alt p-3">
                <View className="gap-1">
                  <Text className="font-sans text-xs font-bold uppercase text-faint">
                    Chỗ cư dân
                  </Text>
                  <Text selectable className="font-sans text-sm font-bold text-fg">
                    {getComplaintSlotCode(complaint)}
                  </Text>
                </View>

                {complaint.offendingSlotCode ? (
                  <View className="gap-1">
                    <Text className="font-sans text-xs font-bold uppercase text-faint">
                      Chỗ đúng của xe vi phạm
                    </Text>
                    <Text selectable className="font-sans text-sm font-bold text-fg">
                      {complaint.offendingSlotCode}
                    </Text>
                  </View>
                ) : null}

                {complaint.description ? (
                  <View className="gap-1">
                    <Text className="font-sans text-xs font-bold uppercase text-faint">
                      Mô tả bạn đã gửi
                    </Text>
                    <Text selectable className="font-sans text-sm font-bold leading-5 text-fg">
                      {complaint.description}
                    </Text>
                  </View>
                ) : null}

                {complaint.resolutionNote ? (
                  <View className="gap-1">
                    <Text className="font-sans text-xs font-bold uppercase text-faint">
                      Cập nhật từ staff
                    </Text>
                    <Text selectable className="font-sans text-sm font-bold leading-5 text-fg">
                      {complaint.resolutionNote}
                    </Text>
                  </View>
                ) : null}

                {getHandledByName(complaint) ? (
                  <View className="gap-1">
                    <Text className="font-sans text-xs font-bold uppercase text-faint">
                      Nhân viên xử lý
                    </Text>
                    <Text selectable className="font-sans text-sm font-bold text-fg">
                      {getHandledByName(complaint)}
                    </Text>
                  </View>
                ) : null}

                {complaint.resolvedAt ? (
                  <View className="gap-1">
                    <Text className="font-sans text-xs font-bold uppercase text-faint">
                      Hoàn tất lúc
                    </Text>
                    <Text selectable className="font-sans text-sm font-bold text-fg">
                      {formatDateTimeWithYear(complaint.resolvedAt)}
                    </Text>
                  </View>
                ) : null}
              </View>
            </GlassCard>
          ))
        )}
      </ScrollView>
    </Page>
  );
}
