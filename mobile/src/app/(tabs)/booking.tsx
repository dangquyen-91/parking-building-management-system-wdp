import { useEffect, useMemo, useState } from "react";
import { Linking, Modal } from "react-native";
import { WebView } from "react-native-webview";
import Ionicons from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";

import { GlassCard, Label, Page } from "../../components/parking-ui";
import { useCurrentUserQuery } from "../../hooks/useAuth";
import {
  useCreateBookingMutation,
  useMyBookingsQuery,
} from "../../hooks/useBookings";
import {
  type Booking,
  type CreateBookingResult,
} from "../../types/bookings";
import { Pressable, ScrollView, Text, TextInput, View } from "../../tw";

const pad = (value: number) => String(value).padStart(2, "0");

const toLocalInputValue = (date: Date) => {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
};

const parseLocalInputValue = (value: string) => {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2})$/);

  if (!match) {
    return null;
  }

  const [, year, month, day, hour, minute] = match;
  const date = new Date(
    Number(year),
    Number(month) - 1,
    Number(day),
    Number(hour),
    Number(minute),
  );

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatDateTime = (value: string) =>
  new Date(value).toLocaleString("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  });

const formatMoney = (value: number) => `${value.toLocaleString("vi-VN")} VND`;

const inputStyle = {
  paddingHorizontal: 16,
  paddingVertical: 14,
};

const getStatusTone = (status: Booking["status"]) => {
  if (status === "paid" || status === "used") {
    return "text-btn-primary";
  }

  if (status === "cancelled" || status === "expired") {
    return "text-faint";
  }

  return "text-fg";
};

export default function Booking() {
  const now = useMemo(() => new Date(), []);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [arrivalTime, setArrivalTime] = useState(
    toLocalInputValue(new Date(now.getTime() + 60 * 60 * 1000)),
  );
  const [exitTime, setExitTime] = useState(
    toLocalInputValue(new Date(now.getTime() + 3 * 60 * 60 * 1000)),
  );
  const [createdBooking, setCreatedBooking] = useState<CreateBookingResult | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  const { data: currentUser } = useCurrentUserQuery();
  const createBookingMutation = useCreateBookingMutation();
  const myBookingsQuery = useMyBookingsQuery(Boolean(currentUser));

  useEffect(() => {
    if (currentUser?.phone && !phoneNumber) {
      setPhoneNumber(currentUser.phone);
    }
  }, [currentUser, phoneNumber]);

  const durationHours = useMemo(() => {
    const arrival = parseLocalInputValue(arrivalTime);
    const exit = parseLocalInputValue(exitTime);

    if (!arrival || !exit || exit <= arrival) {
      return null;
    }

    return Math.ceil((exit.getTime() - arrival.getTime()) / (60 * 60 * 1000));
  }, [arrivalTime, exitTime]);

  const estimatedAmount = durationHours ? Math.min(durationHours * 20000, 120000) : null;

  const handleCreateBooking = async () => {
    const arrival = parseLocalInputValue(arrivalTime);
    const exit = parseLocalInputValue(exitTime);

    if (!phoneNumber.trim() || !licensePlate.trim()) {
      toast.error("Missing information", {
        description: "Please enter phone number and license plate.",
      });
      return;
    }

    if (!arrival || !exit) {
      toast.error("Invalid time", {
        description: "Use the format YYYY-MM-DD HH:mm.",
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

    const hours = Math.ceil((exit.getTime() - arrival.getTime()) / (60 * 60 * 1000));
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
        phoneNumber: phoneNumber.trim(),
        licensePlate: licensePlate.trim(),
        expectedArrivalTime: arrival.toISOString(),
        expectedExitTime: exit.toISOString(),
      });
      setCreatedBooking(result);
      toast.success("Booking created", {
        description: "Complete payment to activate your booking.",
      });
    } catch (error) {
      toast.error("Booking failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
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
                Visitor car booking
              </Text>
              <Text className="font-sans text-sm leading-5 text-subtle">
                Pay before arrival. Pending bookings expire if payment is not completed.
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <View className="gap-2">
              <Label>Phone number</Label>
              <TextInput
                keyboardType="phone-pad"
                onChangeText={setPhoneNumber}
                placeholder="0900000000"
                placeholderTextColor="#6b7280"
                style={inputStyle}
                value={phoneNumber}
                className="rounded-[14px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
              />
            </View>

            <View className="gap-2">
              <Label>License plate</Label>
              <TextInput
                autoCapitalize="characters"
                onChangeText={setLicensePlate}
                placeholder="59A24872"
                placeholderTextColor="#6b7280"
                style={inputStyle}
                value={licensePlate}
                className="rounded-[14px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1 gap-2">
                <Label>Arrival</Label>
                <TextInput
                  onChangeText={setArrivalTime}
                  placeholder="YYYY-MM-DD HH:mm"
                  placeholderTextColor="#6b7280"
                  style={inputStyle}
                  value={arrivalTime}
                  className="rounded-[14px] border border-border-theme bg-input px-4 py-3.5 font-sans text-[13px] text-fg"
                />
              </View>
              <View className="flex-1 gap-2">
                <Label>Exit</Label>
                <TextInput
                  onChangeText={setExitTime}
                  placeholder="YYYY-MM-DD HH:mm"
                  placeholderTextColor="#6b7280"
                  style={inputStyle}
                  value={exitTime}
                  className="rounded-[14px] border border-border-theme bg-input px-4 py-3.5 font-sans text-[13px] text-fg"
                />
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
                {durationHours ? `${durationHours}h` : "--"}
              </Text>
            </View>
          </View>
          <Text className="font-sans text-sm leading-5 text-subtle">
            Car parking is estimated at 20,000 VND per started hour, capped at
            120,000 VND per day. The server confirms the final amount.
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
        ) : null}
      </ScrollView>

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
