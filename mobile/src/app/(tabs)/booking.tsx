import { useMemo, useState } from "react";
import { Platform } from "react-native";
import type { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import Ionicons from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";

import {
  BookingDurationModal,
  BookingEstimateCard,
  BookingFormCard,
  BookingPaymentCard,
  BookingPaymentModal,
  BookingPickerModal,
} from "@/components/booking";
import { AppRefreshControl } from "@/components/common/refresh-control";
import { GlassCard, Page } from "@/components/parking-ui";
import { useCurrentUserQuery } from "../../hooks/useAuth";
import {
  useCancelBookingMutation,
  useConfirmBookingMutation,
  useCreateBookingMutation,
  useGuestBookingsQuery,
  useUpsertGuestBookingMutation,
  useSaveGuestBookingMutation,
} from "../../hooks/useBookings";
import {
  type Booking as BookingRecord,
  type CreateBookingResult,
  type StoredGuestBooking,
} from "../../types/bookings";
import type { DateTimePickerChangeEvent } from "@react-native-community/datetimepicker";
import { createBookingPayloadSchema } from "@/schema";
import { getFieldErrors } from "@/utils/validation";
import { Pressable, ScrollView, Text, View, useThemeColors } from "../../tw";

const HOUR_MS = 60 * 60 * 1000;
const BOOKING_BLOCK_HOURS = 4;
const BOOKING_BLOCK_FEE = 35000;

const calculateBookingEstimate = (durationHours: number) =>
  Math.max(1, Math.ceil(durationHours / BOOKING_BLOCK_HOURS)) * BOOKING_BLOCK_FEE;

type PickerField = "arrivalDate" | "arrivalTime" | null;

type BookingField = "email" | "licensePlate" | "expectedArrivalTime" | "expectedExitTime";

const withDatePart = (source: Date, nextDate: Date) => {
  const updated = new Date(source);
  updated.setFullYear(nextDate.getFullYear(), nextDate.getMonth(), nextDate.getDate());
  return updated;
};

const withTimePart = (source: Date, nextTime: Date) => {
  const updated = new Date(source);
  updated.setHours(nextTime.getHours(), nextTime.getMinutes(), 0, 0);
  return updated;
};

export default function BookingScreen() {
  const { btnPrimaryFg } = useThemeColors();
  const now = useMemo(() => new Date(), []);
  const [guestEmail, setGuestEmail] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [arrivalTime, setArrivalTime] = useState<Date | null>(null);
  const [selectedDurationHours, setSelectedDurationHours] = useState<number | null>(null);
  const [createdBooking, setCreatedBooking] = useState<CreateBookingResult | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [pickerField, setPickerField] = useState<PickerField>(null);
  const [durationModalVisible, setDurationModalVisible] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<BookingField, string>>>({});
  const [isRefreshing, setIsRefreshing] = useState(false);

  const { data: currentUser } = useCurrentUserQuery();
  const createBookingMutation = useCreateBookingMutation();
  const saveGuestBookingMutation = useSaveGuestBookingMutation();
  const upsertGuestBookingMutation = useUpsertGuestBookingMutation();
  const confirmBookingMutation = useConfirmBookingMutation();
  const cancelBookingMutation = useCancelBookingMutation();
  const guestBookingsQuery = useGuestBookingsQuery(!currentUser);

  const email = guestEmail;
  const exitTime = useMemo(
    () =>
      arrivalTime && selectedDurationHours
        ? new Date(arrivalTime.getTime() + selectedDurationHours * HOUR_MS)
        : null,
    [arrivalTime, selectedDurationHours],
  );

  const estimatedAmount = selectedDurationHours
    ? calculateBookingEstimate(selectedDurationHours)
    : null;

  const bookingList = guestBookingsQuery.data ?? [];

  const syncGuestBooking = async (booking: BookingRecord) => {
    if (currentUser) {
      return;
    }

    const currentPayment =
      createdBooking?.booking._id === booking._id
        ? createdBooking?.payment
        : (bookingList.find((item) => item._id === booking._id) as StoredGuestBooking | undefined)
            ?.payment;

    await upsertGuestBookingMutation.mutateAsync({
      ...booking,
      payment: currentPayment,
      savedAt: new Date().toISOString(),
    });
  };

  const handleCreateBooking = async () => {
    const arrival = arrivalTime;
    const exit = exitTime;
    const hours = selectedDurationHours;

    const nextErrors: Partial<Record<BookingField, string>> = {};

    if (!arrival) {
      nextErrors.expectedArrivalTime = "Vui lòng chọn thời gian đến.";
    }

    if (!hours || !exit) {
      nextErrors.expectedExitTime = "Vui lòng chọn thời gian gửi xe.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (!arrival || !exit || !hours) {
      setErrors(nextErrors);
      return;
    }

    const validation = createBookingPayloadSchema.safeParse({
      email,
      licensePlate,
      expectedArrivalTime: arrival.toISOString(),
      expectedExitTime: exit.toISOString(),
    });

    if (!validation.success) {
      setErrors(getFieldErrors<BookingField>(validation.error));
      return;
    }

    const rangeErrors: Partial<Record<BookingField, string>> = {};

    if (arrival <= new Date()) {
      rangeErrors.expectedArrivalTime = "Thời gian đến phải lớn hơn thời điểm hiện tại.";
    }

    if (exit <= arrival) {
      rangeErrors.expectedExitTime = "Thời gian rời đi phải sau thời gian đến.";
    }

    if (hours < 1 || hours > 24) {
      rangeErrors.expectedExitTime = "Thời gian đặt chỗ phải từ 1 đến 24 giờ.";
    }

    if (arrival.getTime() - Date.now() > 24 * 60 * 60 * 1000) {
      rangeErrors.expectedArrivalTime = "Chỉ được đặt chỗ trước tối đa 24 giờ.";
    }

    if (Object.keys(rangeErrors).length > 0) {
      setErrors(rangeErrors);
      return;
    }

    setErrors({});

    try {
      const result = await createBookingMutation.mutateAsync({
        ...validation.data,
        email: validation.data.email.toLowerCase(),
      });
      setCreatedBooking(result);
      if (!currentUser) {
        await saveGuestBookingMutation.mutateAsync(result);
      }
      toast.success("Đặt chỗ thành công", {
        description: "Hãy hoàn tất thanh toán để kích hoạt lượt đặt chỗ.",
      });
    } catch (error) {
      toast.error("Đặt chỗ thất bại", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    }
  };

  const activePickerValue = (() => {
    switch (pickerField) {
      case "arrivalDate":
      case "arrivalTime":
      default:
        return arrivalTime ?? new Date(now.getTime() + HOUR_MS);
    }
  })();

  const activePickerMode = pickerField === "arrivalTime" ? "time" : "date";

  const activePickerMinimumDate = (() => {
    switch (pickerField) {
      case "arrivalDate":
        return new Date();
      default:
        return undefined;
    }
  })();

  const handlePickerChange = (_event: DateTimePickerChangeEvent, selectedDate: Date) => {
    if (pickerField === "arrivalDate") {
      const baseArrival = arrivalTime ?? new Date(now.getTime() + HOUR_MS);
      const nextArrival = withDatePart(baseArrival, selectedDate);
      setArrivalTime(nextArrival);
      setErrors((current) => ({ ...current, expectedArrivalTime: undefined }));
    } else if (pickerField === "arrivalTime") {
      const baseArrival = arrivalTime ?? new Date(now.getTime() + HOUR_MS);
      const nextArrival = withTimePart(baseArrival, selectedDate);
      setArrivalTime(nextArrival);
      setErrors((current) => ({ ...current, expectedArrivalTime: undefined }));
    }

    if (Platform.OS === "android") {
      setPickerField(null);
    }
  };

  const handlePickerDismiss = () => {
    setPickerField(null);
  };

  const handleBookingStateSync = async (nextAction: "confirm" | "cancel") => {
    if (!createdBooking) {
      return;
    }

    try {
      const payload = {
        id: createdBooking.booking._id,
        email: currentUser ? undefined : createdBooking.booking.email,
        licensePlate: currentUser ? undefined : createdBooking.booking.licensePlate,
      };
      const result =
        nextAction === "confirm"
          ? await confirmBookingMutation.mutateAsync(payload)
          : await cancelBookingMutation.mutateAsync(payload);

      const nextBooking = result.booking;
      setCreatedBooking((current) => (current ? { ...current, booking: nextBooking } : current));
      await syncGuestBooking(nextBooking);
      setPaymentUrl(null);

      toast.success(
        nextAction === "confirm" ? "Đã đồng bộ thanh toán" : "Đã cập nhật đặt chỗ",
        {
          description:
            nextAction === "confirm"
              ? "Trạng thái đặt chỗ đã được cập nhật từ hệ thống."
              : "Đặt chỗ đang chờ đã được hủy.",
        },
      );
    } catch (error) {
      toast.error("Không thể đồng bộ đặt chỗ", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau.",
      });
    }
  };

  const handlePaymentNavigationChange = ({ url }: WebViewNavigation) => {
    const normalizedUrl = url.toLowerCase();

    if (normalizedUrl.includes("/payment/success")) {
      void handleBookingStateSync("confirm");
      return;
    }

    if (normalizedUrl.includes("/payment/cancel")) {
      void handleBookingStateSync("cancel");
    }
  };

  const openPayment = (url?: string) => {
    if (!url) {
      return;
    }

    setPaymentUrl(url);
  };

  const resetFormState = () => {
    setGuestEmail("");
    setLicensePlate("");
    setArrivalTime(null);
    setSelectedDurationHours(null);
    setCreatedBooking(null);
    setPaymentUrl(null);
    setPickerField(null);
    setDurationModalVisible(false);
    setErrors({});
  };

  const handleRefreshForm = async () => {
    setIsRefreshing(true);

    try {
      resetFormState();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Page
      eyebrow="Đặt chỗ"
      title="Đặt chỗ bãi xe khách"
      subtitle="Giữ chỗ trong 24 giờ tới, sau đó thanh toán để kích hoạt."
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-5 pb-[120px]"
        refreshControl={
          <AppRefreshControl
            onRefresh={handleRefreshForm}
            refreshing={isRefreshing}
          />
        }
      >
        <GlassCard className="gap-4">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-btn-primary">
              <Ionicons name="car-sport" color={btnPrimaryFg} size={22} />
            </View>
            <View className="flex-1 gap-1">
              <Text className="font-sans text-lg font-extrabold text-fg">
                Đặt chỗ dành cho khách vãng lai
              </Text>
              <Text className="font-sans text-sm leading-5 text-subtle">
                Thanh toán trước khi đến.
              </Text>
            </View>
          </View>

          <BookingFormCard
            arrivalTime={arrivalTime}
            email={email}
            errors={errors}
            exitTime={exitTime}
            licensePlate={licensePlate}
            onChangeEmail={(value) => {
              setGuestEmail(value);
              setErrors((current) => ({ ...current, email: undefined }));
            }}
            onChangeLicensePlate={(value) => {
              setLicensePlate(value);
              setErrors((current) => ({ ...current, licensePlate: undefined }));
            }}
            onOpenDurationPicker={() => setDurationModalVisible(true)}
            onOpenPicker={setPickerField}
            selectedDurationHours={selectedDurationHours}
          />
        </GlassCard>

        <BookingEstimateCard
          estimatedAmount={estimatedAmount}
          selectedDurationHours={selectedDurationHours}
        />

        <Pressable
          className="items-center rounded-full bg-btn-primary py-4"
          disabled={createBookingMutation.isPending}
          onPress={handleCreateBooking}
        >
          <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
            {createBookingMutation.isPending ? "Đang tạo đặt chỗ..." : "Tạo đặt chỗ"}
          </Text>
        </Pressable>

        {createdBooking ? (
          <BookingPaymentCard
            bookingResult={createdBooking}
            onOpenPayment={openPayment}
          />
        ) : null}
      </ScrollView>

      <BookingPickerModal
        minimumDate={activePickerMinimumDate}
        mode={activePickerMode}
        onChange={handlePickerChange}
        onDismiss={handlePickerDismiss}
        pickerField={pickerField}
        value={activePickerValue}
      />

      <BookingDurationModal
        onClose={() => setDurationModalVisible(false)}
        onSelectDuration={(hours) => {
          setSelectedDurationHours(hours);
          setDurationModalVisible(false);
          setErrors((current) => ({ ...current, expectedExitTime: undefined }));
        }}
        selectedDurationHours={selectedDurationHours}
        visible={durationModalVisible}
      />

      <BookingPaymentModal
        onClose={() => setPaymentUrl(null)}
        onNavigationStateChange={handlePaymentNavigationChange}
        paymentUrl={paymentUrl}
      />
    </Page>
  );
}
