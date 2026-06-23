import { Label } from "@/components/parking-ui";
import { formatDurationHours, formatPickerDate, formatPickerTime } from "@/utils/format";
import { Pressable, Text, TextInput, View } from "@/tw";

type BookingField =
  | "email"
  | "licensePlate"
  | "expectedArrivalTime"
  | "expectedExitTime";

type PickerField = "arrivalDate" | "arrivalTime";

const inputStyle = {
  paddingHorizontal: 16,
  paddingVertical: 14,
};

type BookingFormCardProps = {
  arrivalTime: Date | null;
  currentUserEmail?: string;
  email: string;
  errors: Partial<Record<BookingField, string>>;
  exitTime: Date | null;
  licensePlate: string;
  onChangeEmail: (value: string) => void;
  onChangeLicensePlate: (value: string) => void;
  onOpenDurationPicker: () => void;
  onOpenPicker: (field: PickerField) => void;
  selectedDurationHours: number | null;
};

export function BookingFormCard({
  arrivalTime,
  currentUserEmail,
  email,
  errors,
  exitTime,
  licensePlate,
  onChangeEmail,
  onChangeLicensePlate,
  onOpenDurationPicker,
  onOpenPicker,
  selectedDurationHours,
}: BookingFormCardProps) {
  return (
    <View className="gap-3">
      <View className="gap-2">
        <Label>Email</Label>
        <TextInput
          autoCapitalize="none"
          editable={!currentUserEmail}
          keyboardType="email-address"
          onChangeText={onChangeEmail}
          placeholder="guest@example.com"
          placeholderTextColor="#6b7280"
          style={inputStyle}
          value={email}
          className="rounded-[14px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
        />
        {errors.email ? (
          <Text className="font-sans text-sm text-red-400">{errors.email}</Text>
        ) : null}
      </View>

      <View className="gap-2">
        <Label>License plate</Label>
        <TextInput
          autoCapitalize="characters"
          onChangeText={onChangeLicensePlate}
          placeholder="59-AB24872"
          placeholderTextColor="#6b7280"
          style={inputStyle}
          value={licensePlate}
          className="rounded-[14px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
        />
        {errors.licensePlate ? (
          <Text className="font-sans text-sm text-red-400">
            {errors.licensePlate}
          </Text>
        ) : null}
      </View>

      <View className="gap-3">
        <View className="gap-2">
          <Label>Arrival</Label>
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 rounded-[14px] border border-border-theme bg-input px-4 py-3.5"
              onPress={() => onOpenPicker("arrivalDate")}
              style={inputStyle}
            >
              <Text className="font-sans text-[13px] text-fg">
                {arrivalTime ? formatPickerDate(arrivalTime) : "Select date"}
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 rounded-[14px] border border-border-theme bg-input px-4 py-3.5"
              onPress={() => onOpenPicker("arrivalTime")}
              style={inputStyle}
            >
              <Text className="font-sans text-[13px] text-fg">
                {arrivalTime ? formatPickerTime(arrivalTime) : "Select time"}
              </Text>
            </Pressable>
          </View>
          {errors.expectedArrivalTime ? (
            <Text className="font-sans text-sm text-red-400">
              {errors.expectedArrivalTime}
            </Text>
          ) : null}
        </View>

        <View className="gap-2">
          <Label>Exit</Label>
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 rounded-[14px] border border-border-theme bg-input px-4 py-3.5"
              onPress={onOpenDurationPicker}
              style={inputStyle}
            >
              <Text className="font-sans text-[13px] text-fg">
                {selectedDurationHours
                  ? formatDurationHours(selectedDurationHours)
                  : "Select duration"}
              </Text>
            </Pressable>
            <View
              className="flex-1 rounded-[14px] border border-border-theme bg-input px-4 py-3.5"
              style={inputStyle}
            >
              <Text className="font-sans text-[13px] text-fg">
                {exitTime
                  ? `${formatPickerDate(exitTime)} ${formatPickerTime(exitTime)}`
                  : ""}
              </Text>
            </View>
          </View>
          {errors.expectedExitTime ? (
            <Text className="font-sans text-sm text-red-400">
              {errors.expectedExitTime}
            </Text>
          ) : null}
        </View>
      </View>
    </View>
  );
}
