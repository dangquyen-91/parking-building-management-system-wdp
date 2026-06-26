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

const findSelectedCarSlot = (
  availableCarSlots: AvailableCarSlot[],
  selectedSlotId: string | null,
) => availableCarSlots.find(({ slot }) => slot._id === selectedSlotId) ?? null;

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
            Buy a resident plan
          </Text>
          <Text className="font-sans text-sm leading-5 text-subtle">
            Car plans reserve a fixed resident slot. Motorcycle plans share resident
            capacity.
          </Text>
        </View>
      </View>

      <View className="gap-3">
        <View className="gap-2">
          <Label>License plate</Label>
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
          <Label>Choose plan</Label>
          {plansLoading ? (
            <GlassCard className="gap-1">
              <Text className="font-sans text-base font-extrabold text-fg">
                Loading plans...
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
                          {formatVehicleType(plan.vehicleType)} - {plan.durationDays} days
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
              <Label>Resident car slot</Label>
              {availabilityLoading ? (
                <Text className="font-sans text-xs font-bold text-subtle">Loading</Text>
              ) : null}
            </View>

            {availableCarSlots.length > 0 ? (
              <GlassCard className="gap-3">
                <View className="flex-row items-start justify-between gap-3">
                  <View className="flex-1 gap-1">
                    <Text className="font-sans text-base font-extrabold text-fg">
                      {selectedCarSlot?.slot.slotCode ?? "Choose your resident slot"}
                    </Text>
                    {selectedCarSlot ? (
                      <Text className="font-sans text-sm text-subtle">
                        {`Floor B${selectedCarSlot.floor.floorNumber} - ${
                          selectedCarSlot.floor.building?.name ??
                          selectedCarSlot.floor.building?.address ??
                          "Resident building"
                        }`}
                      </Text>
                    ) : (
                      <Text className="font-sans text-sm leading-5 text-subtle">
                        Open the resident slot map and pick a space like choosing a cinema seat.
                      </Text>
                    )}
                  </View>
                  <View className="rounded-full bg-badge px-3 py-1.5">
                    <Text className="font-sans text-xs font-bold uppercase text-fg">
                      {availableCarSlots.length} open
                    </Text>
                  </View>
                </View>

                <Pressable
                  className="items-center rounded-full bg-btn-primary py-3.5"
                  onPress={onOpenSlotPicker}
                >
                  <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                    {selectedCarSlot ? "Change slot in map" : "Open slot map"}
                  </Text>
                </Pressable>
              </GlassCard>
            ) : (
              <GlassCard className="gap-1">
                <Text className="font-sans text-base font-extrabold text-fg">
                  No resident car slots available
                </Text>
                <Text className="font-sans text-sm leading-5 text-subtle">
                  Try again later or choose another plan after a slot becomes free.
                </Text>
              </GlassCard>
            )}
          </View>
        ) : selectedPlan?.vehicleType === "motorcycle" ? (
          <GlassCard className="gap-2">
            <Label>Resident motorcycle capacity</Label>
            <Text className="font-sans text-xl font-extrabold text-fg">
              {motorcycleAvailability
                ? `${motorcycleAvailability.availableCount} spots left`
                : "Checking capacity..."}
            </Text>
            {motorcycleAvailability ? (
              <Text className="font-sans text-sm leading-5 text-subtle">
                {motorcycleAvailability.soldCount}/{motorcycleAvailability.totalCapacity} sold.
                {motorcycleAvailability.note ? ` ${motorcycleAvailability.note}` : ""}
              </Text>
            ) : null}
          </GlassCard>
        ) : null}
      </View>
    </GlassCard>
  );
}
