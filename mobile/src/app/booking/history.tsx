import { useMemo, useState } from "react";
import { Stack } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";

import { BookingHistorySection } from "@/components/booking";
import { AppRefreshControl } from "@/components/common/refresh-control";
import { GlassCard, Page } from "@/components/parking-ui";
import { useCurrentUserQuery } from "@/hooks/useAuth";
import { useMyBookingsQuery } from "@/hooks/useBookings";
import { formatBookingStatus, formatDateTime, formatMoney } from "@/utils/format";
import { Pressable, ScrollView, Text, TextInput, View, useThemeColors } from "@/tw";

const inputStyle = {
  paddingHorizontal: 16,
  paddingVertical: 14,
};

const normalizeSearchText = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export default function BookingHistoryScreen() {
  const { placeholder } = useThemeColors();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const { data: currentUser } = useCurrentUserQuery();
  const myBookingsQuery = useMyBookingsQuery(Boolean(currentUser));
  const bookings = myBookingsQuery.data?.bookings ?? [];
  const normalizedSearchQuery = normalizeSearchText(searchQuery);
  const filteredBookings = useMemo(() => {
    if (!normalizedSearchQuery) {
      return bookings;
    }

    return bookings.filter((booking) => {
      const searchableText = normalizeSearchText(
        [
          booking._id,
          booking.email,
          booking.phone,
          booking.licensePlate,
          booking.status,
          formatBookingStatus(booking.status),
          booking.durationHours,
          booking.amount,
          formatMoney(booking.amount),
          formatDateTime(booking.expectedArrivalTime),
          formatDateTime(booking.expectedExitTime),
        ]
          .filter((value) => value !== null && value !== undefined)
          .join(" "),
      );

      return searchableText.includes(normalizedSearchQuery);
    });
  }, [bookings, normalizedSearchQuery]);

  const handleRefresh = async () => {
    setIsRefreshing(true);

    try {
      const result = await myBookingsQuery.refetch();

      if (result.isSuccess) {
        toast.success("Đã làm mới danh sách đặt chỗ");
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          headerBackTitle: "Quay lại",
          headerTitle: "Các đơn đặt chỗ của tôi",
        }}
      />

      <Page
        eyebrow="Đặt chỗ"
        title="Các đơn đặt chỗ của tôi"
        subtitle="Xem toàn bộ đơn đặt chỗ, trạng thái thanh toán và QR vào / ra cho các đơn đã kích hoạt."
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-4 px-5 pb-[120px]"
          refreshControl={
            <AppRefreshControl
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
            />
          }
        >
          {!currentUser ? (
            <GlassCard className="gap-2">
              <Text className="font-sans text-base font-extrabold text-fg">
                Cần đăng nhập
              </Text>
              <Text className="font-sans text-sm text-subtle">
                Đăng nhập để xem toàn bộ đơn đặt chỗ của bạn.
              </Text>
            </GlassCard>
          ) : (
            <>
              <View className="gap-2">
                <Text className="font-sans text-xs font-bold uppercase text-faint">
                  Tìm kiếm
                </Text>
                <View className="flex-row items-center rounded-[14px] border border-border-theme bg-input">
                  <Ionicons
                    name="search"
                    color={placeholder}
                    size={18}
                    style={{ marginLeft: 14 }}
                  />
                  <TextInput
                    autoCapitalize="none"
                    className="flex-1 font-sans text-base text-fg"
                    onChangeText={setSearchQuery}
                    placeholder="Tìm theo biển số, email, trạng thái, thời gian"
                    placeholderTextColor={placeholder}
                    style={inputStyle}
                    value={searchQuery}
                  />
                  {searchQuery ? (
                    <Pressable className="px-4 py-3.5" onPress={() => setSearchQuery("")}>
                      <Ionicons name="close-circle" color={placeholder} size={18} />
                    </Pressable>
                  ) : null}
                </View>
              </View>

              <BookingHistorySection
                bookings={filteredBookings}
                emptyDescription={
                  normalizedSearchQuery
                    ? "Thử nhập biển số, email, trạng thái hoặc thời gian khác."
                    : "Bạn chưa có đơn đặt chỗ nào. Mở tab Đặt chỗ để tạo đơn mới."
                }
                emptyTitle={
                  normalizedSearchQuery ? "Không tìm thấy đơn phù hợp" : "Chưa có đơn đặt chỗ"
                }
                isFetching={myBookingsQuery.isFetching}
                label="Lịch sử đặt chỗ"
              />
            </>
          )}
        </ScrollView>
      </Page>
    </>
  );
}
