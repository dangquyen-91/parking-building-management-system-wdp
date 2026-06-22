import { useMemo, useState } from "react";
import { Linking, Modal, Platform } from "react-native";
import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import type { WebViewNavigation } from "react-native-webview/lib/WebViewTypes";
import { WebView } from "react-native-webview";
import Ionicons from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";

import { GlassCard, Label, Page } from "../../components/parking-ui";
import { useCurrentUserQuery } from "../../hooks/useAuth";
import {
  useCancelBookingMutation,
  useConfirmBookingMutation,
  useCreateBookingMutation,
  useGuestBookingsQuery,
  useUpsertGuestBookingMutation,
  useSaveGuestBookingMutation,
  useMyBookingsQuery,
} from "../../hooks/useBookings";
import {
  type Booking as BookingRecord,
  type CreateBookingResult,
  type StoredGuestBooking,
} from "../../types/bookings";
import { Pressable, ScrollView, Text, TextInput, View } from "../../tw";

const HOUR_MS = 60 * 60 * 1000;
const BOOKING_BLOCK_HOURS = 4;
const BOOKING_BLOCK_FEE = 35000;

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  });

const formatMoney = (value: number) => `${value.toLocaleString("vi-VN")} VND`;
const formatPickerDate = (value: Date) =>
  value.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
const formatPickerTime = (value: Date) =>
  value.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
const formatDurationHours = (value: number) => `${value} hour${value > 1 ? "s" : ""}`;
const calculateBookingEstimate = (durationHours: number) =>
  Math.max(1, Math.ceil(durationHours / BOOKING_BLOCK_HOURS)) * BOOKING_BLOCK_FEE;

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
type PickerField =
  | "arrivalDate"
  | "arrivalTime"
  | null;

const inputStyle = {
  paddingHorizontal: 16,
  paddingVertical: 14,
};

const getStatusTone = (status: BookingRecord["status"]) => {
  if (status === "paid" || status === "used") {
    return "text-btn-primary";
  }

  if (status === "cancelled" || status === "expired") {
    return "text-faint";
  }

  return "text-fg";
};

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
  const now = useMemo(() => new Date(), []);
  const defaultArrival = useMemo(() => new Date(now.getTime() + HOUR_MS), [now]);
  const defaultExit = useMemo(() => new Date(now.getTime() + 3 * HOUR_MS), [now]);
  const [guestEmail, setGuestEmail] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [arrivalTime, setArrivalTime] = useState(defaultArrival);
  const [selectedDurationHours, setSelectedDurationHours] = useState(
    Math.ceil((defaultExit.getTime() - defaultArrival.getTime()) / HOUR_MS),
  );
  const [createdBooking, setCreatedBooking] = useState<CreateBookingResult | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);
  const [pickerField, setPickerField] = useState<PickerField>(null);
  const [durationModalVisible, setDurationModalVisible] = useState(false);

  const { data: currentUser } = useCurrentUserQuery();
  const createBookingMutation = useCreateBookingMutation();
  const saveGuestBookingMutation = useSaveGuestBookingMutation();
  const upsertGuestBookingMutation = useUpsertGuestBookingMutation();
  const confirmBookingMutation = useConfirmBookingMutation();
  const cancelBookingMutation = useCancelBookingMutation();
  const myBookingsQuery = useMyBookingsQuery(Boolean(currentUser));
  const guestBookingsQuery = useGuestBookingsQuery(!currentUser);

  const email = currentUser?.email ?? guestEmail;
  const exitTime = useMemo(
    () => new Date(arrivalTime.getTime() + selectedDurationHours * HOUR_MS),
    [arrivalTime, selectedDurationHours],
  );

  const estimatedAmount = calculateBookingEstimate(selectedDurationHours);

  const bookingList = currentUser
    ? (myBookingsQuery.data?.bookings ?? [])
    : (guestBookingsQuery.data ?? []);

  const syncGuestBooking = async (booking: BookingRecord) => {
    if (currentUser) {
      return;
    }

    const currentPayment = createdBooking?.booking._id === booking._id
      ? createdBooking?.payment
      : (bookingList.find((item) => item._id === booking._id) as StoredGuestBooking | undefined)?.payment;

    await upsertGuestBookingMutation.mutateAsync({
      ...booking,
      payment: currentPayment,
      savedAt: new Date().toISOString(),
    });
  };

  const handleCreateBooking = async () => {
    const arrival = arrivalTime;
    const exit = exitTime;

    if (!email.trim() || !licensePlate.trim()) {
      toast.error("Missing information", {
        description: "Please enter email and license plate.",
      });
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Invalid email", {
        description: "Please enter a valid email address.",
      });
      return;
    }

    if (arrival <= new Date()) {
      toast.error("Invalid time", {
        description: "Arrival time must be in the future.",
      });
      return;
    }

    if (exit <= arrival) {
      toast.error("Invalid time", {
        description: "Exit time must be after arrival time.",
      });
      return;
    }

    const hours = selectedDurationHours;
    if (hours < 1 || hours > 24) {
      toast.error("Invalid duration", {
        description: "Booking duration must be from 1 to 24 hours.",
      });
      return;
    }

    if (arrival.getTime() - Date.now() > 24 * 60 * 60 * 1000) {
      toast.error("Invalid arrival", {
        description: "Bookings can only be made up to 24 hours ahead.",
      });
      return;
    }

    try {
      const result = await createBookingMutation.mutateAsync({
        email: email.trim().toLowerCase(),
        licensePlate: licensePlate.trim(),
        expectedArrivalTime: arrival.toISOString(),
        expectedExitTime: exit.toISOString(),
      });
      setCreatedBooking(result);
      if (!currentUser) {
        await saveGuestBookingMutation.mutateAsync(result);
      }
      toast.success("Booking created", {
        description: "Complete payment to activate your booking.",
      });
    } catch (error) {
      toast.error("Booking failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  const activePickerValue = (() => {
    switch (pickerField) {
      case "arrivalDate":
      case "arrivalTime":
      default:
        return arrivalTime;
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
      const nextArrival = withDatePart(arrivalTime, selectedDate);
      setArrivalTime(nextArrival);
    } else if (pickerField === "arrivalTime") {
      const nextArrival = withTimePart(arrivalTime, selectedDate);
      setArrivalTime(nextArrival);
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
      const result = nextAction === "confirm"
        ? await confirmBookingMutation.mutateAsync(payload)
        : await cancelBookingMutation.mutateAsync(payload);

      const nextBooking = result.booking;
      setCreatedBooking((current) => (current ? { ...current, booking: nextBooking } : current));
      await syncGuestBooking(nextBooking);
      setPaymentUrl(null);

      toast.success(
        nextAction === "confirm" ? "Payment synced" : "Booking updated",
        {
          description:
            nextAction === "confirm"
              ? "Booking status has been refreshed from the server."
              : "Pending booking has been cancelled.",
        },
      );
    } catch (error) {
      toast.error("Unable to sync booking", {
        description: error instanceof Error ? error.message : "Please refresh later.",
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

  const openPaymentInBrowser = async () => {
    if (!paymentUrl) {
      return;
    }

    await Linking.openURL(paymentUrl);
  };

  return (
    <Page
      eyebrow="Reservation"
      title="Book visitor parking"
      subtitle="Hold a visitor car space for the next 24 hours, then complete payment to activate it."
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-5 pb-[120px]"
      >
        <GlassCard className="gap-4">
          <View className="flex-row items-center gap-3">
            <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-btn-primary">
              <Ionicons name="car-sport" color="#000000" size={22} />
            </View>
            <View className="flex-1 gap-1">
              <Text className="font-sans text-lg font-extrabold text-fg">
                Visitor booking
              </Text>
              <Text className="font-sans text-sm leading-5 text-subtle">
                Pay before arrival. Pending bookings expire if payment is not completed.
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <View className="gap-2">
              <Label>Email</Label>
              <TextInput
                autoCapitalize="none"
                editable={!currentUser?.email}
                keyboardType="email-address"
                onChangeText={setGuestEmail}
                placeholder="guest@example.com"
                placeholderTextColor="#6b7280"
                style={inputStyle}
                value={email}
                className="rounded-[14px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
              />
            </View>

            <View className="gap-2">
              <Label>License plate</Label>
              <TextInput
                autoCapitalize="characters"
                onChangeText={setLicensePlate}
                placeholder="59-AB24872"
                placeholderTextColor="#6b7280"
                style={inputStyle}
                value={licensePlate}
                className="rounded-[14px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
              />
            </View>

            <View className="gap-3">
              <View className="gap-2">
                <Label>Arrival</Label>
                <View className="flex-row gap-3">
                  <Pressable
                    className="flex-1 rounded-[14px] border border-border-theme bg-input px-4 py-3.5"
                    onPress={() => setPickerField("arrivalDate")}
                    style={inputStyle}
                  >
                    <Text className="font-sans text-[13px] text-fg">
                      {formatPickerDate(arrivalTime)}
                    </Text>
                  </Pressable>
                  <Pressable
                    className="flex-1 rounded-[14px] border border-border-theme bg-input px-4 py-3.5"
                    onPress={() => setPickerField("arrivalTime")}
                    style={inputStyle}
                  >
                    <Text className="font-sans text-[13px] text-fg">
                      {formatPickerTime(arrivalTime)}
                    </Text>
                  </Pressable>
                </View>
              </View>

              <View className="gap-2">
                <Label>Exit</Label>
                <View className="flex-row gap-3">
                  <Pressable
                    className="flex-1 rounded-[14px] border border-border-theme bg-input px-4 py-3.5"
                    onPress={() => setDurationModalVisible(true)}
                    style={inputStyle}
                  >
                    <Text className="font-sans text-[13px] text-fg">
                      {formatDurationHours(selectedDurationHours)}
                    </Text>
                  </Pressable>
                  <View
                    className="flex-1 rounded-[14px] border border-border-theme bg-input px-4 py-3.5"
                    style={inputStyle}
                  >
                    <Text className="font-sans text-[13px] text-fg">
                      {`${formatPickerDate(exitTime)} ${formatPickerTime(exitTime)}`}
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </GlassCard>

        <GlassCard className="gap-3">
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Label>Estimate</Label>
              <Text className="font-sans text-xl font-extrabold text-fg">
                {estimatedAmount ? formatMoney(estimatedAmount) : "Check time range"}
              </Text>
            </View>
            <View className="items-end gap-1">
              <Label>Duration</Label>
              <Text className="font-sans text-base font-bold text-muted">
                {selectedDurationHours}h
              </Text>
            </View>
          </View>
          <Text className="font-sans text-sm leading-5 text-subtle">
            Car parking is charged at 35,000 VND per 4-hour block, rounded up.
            For example, 5-8 hours is 70,000 VND and 9-12 hours is 105,000 VND.
          </Text>
        </GlassCard>

        <Pressable
          className="items-center rounded-full bg-btn-primary py-4"
          disabled={createBookingMutation.isPending}
          onPress={handleCreateBooking}
        >
          <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
            {createBookingMutation.isPending ? "Creating booking..." : "Create booking"}
          </Text>
        </Pressable>

        {createdBooking ? (
          <GlassCard className="gap-4">
            <View className="flex-row items-start justify-between gap-3">
              <View className="flex-1 gap-1">
                <Label>Payment required</Label>
                <Text className="font-sans text-xl font-extrabold text-fg">
                  {formatMoney(createdBooking.payment.amount)}
                </Text>
                <Text className="font-sans text-sm text-subtle">
                  Order #{createdBooking.payment.orderCode}
                </Text>
              </View>
              <Text className="rounded-full bg-badge px-3 py-1 font-sans text-xs font-bold uppercase text-fg">
                {createdBooking.booking.status}
              </Text>
            </View>

            <View className="gap-2 rounded-[14px] bg-surface-alt p-3">
              <Text selectable className="font-sans text-base font-extrabold text-fg">
                {createdBooking.booking.licensePlate}
              </Text>
              <Text className="font-sans text-sm text-subtle">
                {formatDateTime(createdBooking.booking.expectedArrivalTime)} -{" "}
                {formatDateTime(createdBooking.booking.expectedExitTime)}
              </Text>
            </View>

            <Pressable
              className="items-center rounded-full bg-btn-primary py-3.5"
              onPress={() => openPayment(createdBooking.payment.checkoutUrl)}
            >
              <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                Open payment
              </Text>
            </Pressable>
          </GlassCard>
        ) : null}

        {currentUser ? (
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Label>My bookings</Label>
              {myBookingsQuery.isFetching ? (
                <Text className="font-sans text-xs font-bold text-subtle">Loading</Text>
              ) : null}
            </View>

            {(myBookingsQuery.data?.bookings ?? []).slice(0, 3).map((booking) => (
              <GlassCard key={booking._id} className="gap-2.5">
                <View className="flex-row items-center justify-between gap-3">
                  <Text selectable className="font-sans text-base font-extrabold text-fg">
                    {booking.licensePlate}
                  </Text>
                  <Text
                    className={`font-sans text-xs font-extrabold uppercase ${getStatusTone(
                      booking.status,
                    )}`}
                  >
                    {booking.status}
                  </Text>
                </View>
                <Text className="font-sans text-sm text-subtle">
                  {formatDateTime(booking.expectedArrivalTime)} -{" "}
                  {formatDateTime(booking.expectedExitTime)}
                </Text>
                <Text className="font-sans text-sm font-bold text-muted">
                  {formatMoney(booking.amount)}
                </Text>
              </GlassCard>
            ))}

            {myBookingsQuery.data?.bookings?.length === 0 ? (
              <GlassCard className="gap-1">
                <Text className="font-sans text-base font-extrabold text-fg">
                  No bookings yet
                </Text>
                <Text className="font-sans text-sm text-subtle">
                  Your latest visitor parking bookings will appear here.
                </Text>
              </GlassCard>
            ) : null}
          </View>
        ) : (
          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <Label>Guest bookings on this device</Label>
              {guestBookingsQuery.isFetching ? (
                <Text className="font-sans text-xs font-bold text-subtle">Loading</Text>
              ) : null}
            </View>

            {bookingList.slice(0, 3).map((booking) => (
              <GlassCard key={booking._id} className="gap-2.5">
                <View className="flex-row items-center justify-between gap-3">
                  <View className="flex-1 gap-1">
                    <Text selectable className="font-sans text-base font-extrabold text-fg">
                      {booking.licensePlate}
                    </Text>
                    <Text className="font-sans text-sm text-subtle">
                      {(booking as StoredGuestBooking).email}
                    </Text>
                  </View>
                  <Text
                    className={`font-sans text-xs font-extrabold uppercase ${getStatusTone(
                      booking.status,
                    )}`}
                  >
                    {booking.status}
                  </Text>
                </View>
                <Text className="font-sans text-sm text-subtle">
                  {formatDateTime(booking.expectedArrivalTime)} -{" "}
                  {formatDateTime(booking.expectedExitTime)}
                </Text>
                <Text className="font-sans text-sm font-bold text-muted">
                  {formatMoney(booking.amount)}
                </Text>
              </GlassCard>
            ))}

            {!guestBookingsQuery.isFetching && bookingList.length === 0 ? (
              <GlassCard className="gap-1">
                <Text className="font-sans text-base font-extrabold text-fg">
                  No guest bookings yet
                </Text>
                <Text className="font-sans text-sm text-subtle">
                  Bookings created without signing in will stay visible during this app session.
                </Text>
              </GlassCard>
            ) : null}
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="slide"
        onRequestClose={() => setPickerField(null)}
        transparent
        visible={Boolean(pickerField)}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="gap-4 rounded-t-[28px] bg-page px-5 pb-8 pt-5">
            <View className="flex-row items-center justify-between">
              <Text className="font-sans text-lg font-extrabold text-fg">
                {pickerField === "arrivalDate" && "Select arrival date"}
                {pickerField === "arrivalTime" && "Select arrival time"}
              </Text>
              <Pressable
                className="rounded-full bg-badge px-4 py-2"
                onPress={() => setPickerField(null)}
              >
                <Text className="font-sans text-sm font-bold text-fg">Done</Text>
              </Pressable>
            </View>

            <View className="items-center rounded-[20px] bg-glass-card py-3">
              <DateTimePicker
                display="spinner"
                minuteInterval={15}
                minimumDate={activePickerMinimumDate}
                mode={activePickerMode}
                onDismiss={handlePickerDismiss}
                onValueChange={handlePickerChange}
                value={activePickerValue}
              />
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        onRequestClose={() => setDurationModalVisible(false)}
        transparent
        visible={durationModalVisible}
      >
        <View className="flex-1 justify-end bg-black/60">
          <View className="gap-4 rounded-t-[28px] bg-page px-5 pb-8 pt-5">
            <View className="flex-row items-center justify-between">
              <Text className="font-sans text-lg font-extrabold text-fg">
                Select parking duration
              </Text>
              <Pressable
                className="rounded-full bg-badge px-4 py-2"
                onPress={() => setDurationModalVisible(false)}
              >
                <Text className="font-sans text-sm font-bold text-fg">Done</Text>
              </Pressable>
            </View>

            <ScrollView className="max-h-80" contentContainerClassName="gap-2 pb-2">
              {Array.from({ length: 24 }, (_, index) => {
                const hours = index + 1;
                const isSelected = hours === selectedDurationHours;

                return (
                  <Pressable
                    key={hours}
                    className={`rounded-[18px] border px-4 py-4 ${
                      isSelected
                        ? "border-btn-primary bg-btn-primary"
                        : "border-border-theme bg-glass-card"
                    }`}
                    onPress={() => {
                      setSelectedDurationHours(hours);
                      setDurationModalVisible(false);
                    }}
                  >
                    <Text
                      className={`font-sans text-base font-bold ${
                        isSelected ? "text-btn-primary-fg" : "text-fg"
                      }`}
                    >
                      {formatDurationHours(hours)}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        onRequestClose={() => setPaymentUrl(null)}
        presentationStyle="fullScreen"
        visible={Boolean(paymentUrl)}
      >
        <View className="flex-1 bg-page">
          <View className="flex-row items-center justify-between border-b border-border-theme bg-glass-card px-4 pb-3 pt-14">
            <Pressable
              className="h-10 w-10 items-center justify-center rounded-full bg-badge"
              onPress={() => setPaymentUrl(null)}
            >
              <Ionicons name="close" color="#ffffff" size={22} />
            </Pressable>

            <Text className="font-sans text-base font-extrabold text-fg">
              PayOS payment
            </Text>

            <Pressable
              className="h-10 w-10 items-center justify-center rounded-full bg-badge"
              onPress={openPaymentInBrowser}
            >
              <Ionicons name="open-outline" color="#ffffff" size={20} />
            </Pressable>
          </View>

          {paymentUrl ? (
            <WebView
              onNavigationStateChange={handlePaymentNavigationChange}
              source={{ uri: paymentUrl }}
              startInLoadingState
              className="flex-1"
            />
          ) : null}
        </View>
      </Modal>
    </Page>
  );
}
