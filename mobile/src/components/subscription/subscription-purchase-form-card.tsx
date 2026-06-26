import { GlassCard, Label } from "@/components/parking-ui";
import type {
  CarSubscriptionAvailabilityResult,
  MotorcycleSubscriptionAvailabilityResult,
  Plan,
} from "@/types/subscriptions";
import { formatMoney, formatVehicleType } from "@/utils/format";
import { Pressable, Text, TextInput, View, useThemeColors } from "@/tw";
import Ionicons from "react-native-vector-icons/Ionicons";

type AvailableCarSlot = {
  floor: CarSubscriptionAvailabilityResult["floors"][number]["floor"];
  slot: CarSubscriptionAvailabilityResult["floors"][number]["slots"][number];
};

type SubscriptionPurchaseFormCardProps = {
  availableCarSlots: AvailableCarSlot[];
  availabilityLoading: boolean;
  licensePlate: string;
  motorcycleAvailability?: MotorcycleSubscriptionAvailabilityResult;
  onChangeLicensePlate: (value: string) => void;
  onOpenSlotPicker: () => void;
  onSelectPlan: (planId: string) => void;
  plans: Plan[];
  plansLoading: boolean;
  selectedPlan: Plan | null;
  selectedPlanId: string | null;
  selectedSlotId: string | null;
};

const findSelectedCarSlot = (availableCarSlots: AvailableCarSlot[], selectedSlotId: string | null) =>
  availableCarSlots.find(({ slot }) => slot._id === selectedSlotId) ?? null;

export function SubscriptionPurchaseFormCard({
  availableCarSlots,
  availabilityLoading,
  licensePlate,
  motorcycleAvailability,
  onChangeLicensePlate,
  onOpenSlotPicker,
  onSelectPlan,
  plans,
  plansLoading,
  selectedPlan,
  selectedPlanId,
  selectedSlotId,
}: SubscriptionPurchaseFormCardProps) {
  const { btnPrimaryFg, placeholder } = useThemeColors();
  const selectedCarSlot = findSelectedCarSlot(availableCarSlots, selectedSlotId);

  return (
    <GlassCard className="gap-4">
      <View className="flex-row items-center gap-3">
        <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-btn-primary">
          <Ionicons name="card" color={btnPrimaryFg} size={22} />
        </View>
        <View className="flex-1 gap-1">
          <Text className="font-sans text-lg font-extrabold text-fg">
            Mua gói gửi xe cư dân
          </Text>
          <Text className="font-sans text-sm leading-5 text-subtle">
            Gói ô tô sẽ giữ một chỗ cố định. Gói xe máy dùng chung sức chứa cư dân.
          </Text>
        </View>
      </View>

      <View className="gap-3">
        <View className="gap-2">
          <Label>Biển số xe</Label>
          <TextInput
            autoCapitalize="characters"
            onChangeText={onChangeLicensePlate}
            placeholder="59-AB24872"
            placeholderTextColor={placeholder}
            value={licensePlate}
            className="rounded-[14px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
          />
        </View>

        <View className="gap-2">
          <Label>Chọn gói</Label>
          {plansLoading ? (
            <GlassCard className="gap-1">
              <Text className="font-sans text-base font-extrabold text-fg">
                Đang tải danh sách gói...
              </Text>
            </GlassCard>
          ) : (
            <View className="gap-2">
              {plans.map((plan) => {
                const isSelected = plan._id === selectedPlanId;

                return (
                  <Pressable
                    key={plan._id}
                    className={`rounded-[18px] border px-4 py-4 ${
                      isSelected
                        ? "border-btn-primary bg-btn-primary"
                        : "border-border-theme bg-glass-card"
                    }`}
                    onPress={() => onSelectPlan(plan._id)}
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1 gap-1">
                        <Text
                          className={`font-sans text-base font-extrabold ${
                            isSelected ? "text-btn-primary-fg" : "text-fg"
                          }`}
                        >
                          {plan.name}
                        </Text>
                        <Text
                          className={`font-sans text-sm ${
                            isSelected ? "text-btn-primary-fg" : "text-subtle"
                          }`}
                        >
                          {formatVehicleType(plan.vehicleType)} - {plan.durationDays} ngày
                        </Text>
                        {plan.description ? (
                          <Text
                            className={`font-sans text-sm leading-5 ${
                              isSelected ? "text-btn-primary-fg" : "text-subtle"
                            }`}
                          >
                            {plan.description}
                          </Text>
                        ) : null}
                      </View>
                      <Text
                        className={`font-sans text-sm font-extrabold ${
                          isSelected ? "text-btn-primary-fg" : "text-fg"
                        }`}
                      >
                        {formatMoney(plan.price)}
                      </Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          )}
        </View>

        {selectedPlan?.vehicleType === "car" ? (
          <View className="gap-2">
            <View className="flex-row items-center justify-between gap-3">
              <Label>Chỗ ô tô cư dân</Label>
              {availabilityLoading ? (
                <Text className="font-sans text-xs font-bold text-subtle">Đang tải</Text>
              ) : null}
            </View>

            {availableCarSlots.length > 0 ? (
              <GlassCard className="gap-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 gap-1">
                    <Text className="font-sans text-base font-extrabold text-fg">
                      {selectedCarSlot?.slot.slotCode ?? "Chọn chỗ đỗ cư dân"}
                    </Text>
                    {selectedCarSlot ? (
                      <Text className="font-sans text-sm text-subtle">
                        {`Tầng B${selectedCarSlot.floor.floorNumber} - ${
                          selectedCarSlot.floor.building?.name ??
                          selectedCarSlot.floor.building?.address ??
                          "Khu cư dân"
                        }`}
                      </Text>
                    ) : (
                      <Text className="font-sans text-sm leading-5 text-subtle">
                        Mở sơ đồ chỗ đỗ cư dân và chọn vị trí giống như chọn ghế trong rạp.
                      </Text>
                    )}
                  </View>
                  <View className="rounded-full bg-badge px-3 py-1.5">
                    <Text className="font-sans text-xs font-bold uppercase text-fg">
                      {availableCarSlots.length} chỗ trống
                    </Text>
                  </View>
                </View>

                <Pressable
                  className="items-center rounded-full bg-btn-primary py-3.5"
                  onPress={onOpenSlotPicker}
                >
                  <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                    {selectedCarSlot ? "Đổi chỗ trên sơ đồ" : "Mở sơ đồ chỗ đỗ"}
                  </Text>
                </Pressable>
              </GlassCard>
            ) : (
              <GlassCard className="gap-1">
                <Text className="font-sans text-base font-extrabold text-fg">
                  Hiện không còn chỗ ô tô cư dân
                </Text>
                <Text className="font-sans text-sm leading-5 text-subtle">
                  Hãy thử lại sau hoặc chọn gói khác khi có chỗ trống.
                </Text>
              </GlassCard>
            )}
          </View>
        ) : selectedPlan?.vehicleType === "motorcycle" ? (
          <GlassCard className="gap-2">
            <Label>Sức chứa xe máy cư dân</Label>
            <Text className="font-sans text-xl font-extrabold text-fg">
              {motorcycleAvailability
                ? `${motorcycleAvailability.availableCount} chỗ còn lại`
                : "Đang kiểm tra sức chứa..."}
            </Text>
            {motorcycleAvailability ? (
              <Text className="font-sans text-sm leading-5 text-subtle">
                Đã bán {motorcycleAvailability.soldCount}/{motorcycleAvailability.totalCapacity}.
                {motorcycleAvailability.note ? ` ${motorcycleAvailability.note}` : ""}
              </Text>
            ) : null}
          </GlassCard>
        ) : null}
      </View>
    </GlassCard>
  );
}
