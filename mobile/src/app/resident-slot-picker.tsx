import { useMemo, useState } from "react";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";

import { GlassCard, Label } from "@/components/parking-ui";
import { useAvailableSubscriptionSlotsQuery } from "@/hooks/useSubscriptions";
import {
  isCarSubscriptionAvailabilityResult,
  type CarSubscriptionAvailabilityResult,
} from "@/types/subscriptions";
import { formatSlotStatus } from "@/utils/format";
import { Pressable, ScrollView, Text, View, useThemeColors } from "@/tw";

type SlotPickerParams = {
  licensePlate?: string | string[];
  selectedPlanId?: string | string[];
  selectedSlotId?: string | string[];
};

const getSingleParam = (value?: string | string[]) => (typeof value === "string" ? value : null);

const buildSeatRows = (slots: CarSubscriptionAvailabilityResult["floors"][number]["slots"]) => {
  const midpoint = Math.ceil(slots.length / 2);
  const left = slots.slice(0, midpoint);
  const right = slots.slice(midpoint);
  const rowCount = Math.max(left.length, right.length);

  return Array.from({ length: rowCount }, (_, index) => ({
    left: left[index] ?? null,
    right: right[index] ?? null,
  }));
};

export default function ResidentSlotPickerScreen() {
  const router = useRouter();
  const { btnPrimaryFg, iconMuted, iconPrimary } = useThemeColors();
  const params = useLocalSearchParams<SlotPickerParams>();
  const selectedPlanId = getSingleParam(params.selectedPlanId);
  const licensePlate = getSingleParam(params.licensePlate);
  const routeSelectedSlotId = getSingleParam(params.selectedSlotId);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(routeSelectedSlotId);

  const availabilityQuery = useAvailableSubscriptionSlotsQuery("car", true);

  const availability = isCarSubscriptionAvailabilityResult(availabilityQuery.data)
    ? availabilityQuery.data
    : undefined;

  const selectedSlot = useMemo(
    () =>
      availability?.floors
        .flatMap((entry) => entry.slots.map((slot) => ({ floor: entry.floor, slot })))
        .find(({ slot }) => slot._id === selectedSlotId) ?? null,
    [availability?.floors, selectedSlotId],
  );

  const handleApplySlot = () => {
    if (!selectedPlanId || !selectedSlotId) {
      router.back();
      return;
    }

    router.replace({
      pathname: "/(tabs)/subscription",
      params: {
        licensePlate: licensePlate ?? undefined,
        selectedPlanId,
        selectedSlotId,
      },
    });
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          headerBackTitle: "Gói gửi xe",
          headerTitle: "Chọn vị trí cư dân",
        }}
      />

      <View className="flex-1 bg-page">
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-4 px-5 pb-[120px]"
        >
          <GlassCard className="gap-4">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-btn-primary">
                <Ionicons name="car-sport" color={btnPrimaryFg} size={22} />
              </View>
              <View className="flex-1 gap-1">
                <Text className="font-sans text-lg font-extrabold text-fg">
                  Sơ đồ chỗ đỗ cư dân
                </Text>
                <Text className="font-sans text-sm leading-5 text-subtle">
                  Chọn một vị trí còn trống. Bố cục được nhóm như sơ đồ ghế để dễ quan sát lối đi.
                </Text>
              </View>
            </View>

            <View className="flex-row flex-wrap gap-2">
              <View className="flex-row items-center gap-2 rounded-full bg-badge px-3 py-2">
                <View className="h-3 w-3 rounded-full bg-btn-primary" />
                <Text className="font-sans text-xs font-bold text-fg">Đã chọn</Text>
              </View>
              <View className="flex-row items-center gap-2 rounded-full bg-badge px-3 py-2">
                <View className="h-3 w-3 rounded-full border border-border-strong bg-glass-card" />
                <Text className="font-sans text-xs font-bold text-fg">Còn trống</Text>
              </View>
              <View className="flex-row items-center gap-2 rounded-full bg-badge px-3 py-2">
                <View className="h-3 w-3 rounded-full bg-page opacity-60" />
                <Text className="font-sans text-xs font-bold text-fg">Đã có xe</Text>
              </View>
            </View>

            {licensePlate ? (
              <View className="rounded-[18px] border border-border-theme bg-badge px-4 py-3">
                <Label>Phương tiện</Label>
                <Text selectable className="mt-1 font-sans text-base font-extrabold text-fg">
                  {licensePlate.toUpperCase()}
                </Text>
              </View>
            ) : null}
          </GlassCard>

          {availabilityQuery.isLoading ? (
            <GlassCard className="gap-1">
              <Text className="font-sans text-base font-extrabold text-fg">
                Đang tải sơ đồ chỗ đỗ...
              </Text>
              <Text className="font-sans text-sm text-subtle">
                Đang lấy dữ liệu chỗ cư dân mới nhất.
              </Text>
            </GlassCard>
          ) : null}

          {!availabilityQuery.isLoading && !availability?.floors.length ? (
            <GlassCard className="gap-1">
              <Text className="font-sans text-base font-extrabold text-fg">
                Hiện không còn chỗ ô tô cư dân
              </Text>
              <Text className="font-sans text-sm leading-5 text-subtle">
                Tất cả chỗ đỗ cố định của cư dân đều đã kín. Vui lòng thử lại sau.
              </Text>
            </GlassCard>
          ) : null}

          {availability?.floors.map((entry) => {
            const rows = buildSeatRows(entry.slots);

            return (
              <GlassCard key={entry.floor._id} className="gap-4">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 gap-1">
                    <Label>Tầng B{entry.floor.floorNumber}</Label>
                    <Text className="font-sans text-xl font-extrabold text-fg">
                      {entry.floor.building?.name ?? "Khu gửi xe cư dân"}
                    </Text>
                    <Text className="font-sans text-sm text-subtle">
                      {entry.availableCount}/{entry.floor.totalSlots} chỗ còn trống
                    </Text>
                  </View>
                  <View className="rounded-full bg-badge px-3 py-1.5">
                    <Text className="font-sans text-xs font-bold uppercase text-fg">
                      Hướng màn hình
                    </Text>
                  </View>
                </View>

                <View className="items-center rounded-full border border-dashed border-border-strong py-2">
                  <Text className="font-sans text-xs font-bold uppercase tracking-[2px] text-faint">
                    Lối vào
                  </Text>
                </View>

                <View className="gap-3">
                  {rows.map((row, index) => (
                    <View key={`${entry.floor._id}-${index}`} className="flex-row items-center gap-3">
                      {[row.left, row.right].map((slot, columnIndex) => {
                        if (!slot) {
                          return <View key={`empty-${columnIndex}`} className="flex-1" />;
                        }

                        const isSelected = slot._id === selectedSlotId;
                        const isAvailable = slot.available;

                        return (
                          <Pressable
                            key={slot._id}
                            className={`flex-1 rounded-[18px] border px-3 py-4 ${
                              isSelected
                                ? "border-btn-primary bg-btn-primary"
                                : isAvailable
                                  ? "border-border-theme bg-glass-card"
                                  : "border-border-theme bg-page opacity-55"
                            }`}
                            disabled={!isAvailable}
                            onPress={() => setSelectedSlotId(slot._id)}
                          >
                            <View className="items-center gap-1">
                              <Ionicons
                                name={isSelected ? "car-sport" : "car-sport-outline"}
                                color={isSelected ? btnPrimaryFg : isAvailable ? iconPrimary : iconMuted}
                                size={20}
                              />
                              <Text
                                className={`font-sans text-sm font-extrabold ${
                                  isSelected
                                    ? "text-btn-primary-fg"
                                    : isAvailable
                                      ? "text-fg"
                                      : "text-faint"
                                }`}
                              >
                                {slot.slotCode}
                              </Text>
                              <Text
                                className={`font-sans text-[11px] font-bold uppercase ${
                                  isSelected
                                    ? "text-btn-primary-fg"
                                    : isAvailable
                                      ? "text-subtle"
                                      : "text-faint"
                                }`}
                              >
                                {isAvailable ? "Còn trống" : formatSlotStatus(slot.status)}
                              </Text>
                            </View>
                          </Pressable>
                        );
                      })}
                    </View>
                  ))}
                </View>
              </GlassCard>
            );
          })}
        </ScrollView>

        <View className="border-t border-border-theme bg-page px-5 pb-8 pt-4">
          <GlassCard className="gap-3">
            <View className="flex-row items-center justify-between gap-3">
              <View className="flex-1 gap-1">
                <Label>Chỗ đã chọn</Label>
                <Text className="font-sans text-lg font-extrabold text-fg">
                  {selectedSlot ? selectedSlot.slot.slotCode : "Chưa chọn chỗ"}
                </Text>
                <Text className="font-sans text-sm text-subtle">
                  {selectedSlot
                    ? `Tầng B${selectedSlot.floor.floorNumber}`
                    : "Hãy chạm vào một chỗ trống để liên kết với gói cư dân này."}
                </Text>
              </View>
              <View className="h-11 w-11 items-center justify-center rounded-full bg-badge">
                <Ionicons name="ticket-outline" color={iconPrimary} size={22} />
              </View>
            </View>

            <Pressable
              className={`items-center rounded-full py-4 ${
                selectedSlot ? "bg-btn-primary" : "bg-badge"
              }`}
              disabled={!selectedSlot}
              onPress={handleApplySlot}
            >
              <Text
                className={`font-sans text-base font-extrabold ${
                  selectedSlot ? "text-btn-primary-fg" : "text-faint"
                }`}
              >
                Dùng chỗ đỗ này
              </Text>
            </Pressable>
          </GlassCard>
        </View>
      </View>
    </>
  );
}
