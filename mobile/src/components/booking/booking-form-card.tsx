import { Label } from "@/components/parking-ui";
import { formatDurationHours, formatPickerDate, formatPickerTime } from "@/utils/format";
import { Pressable, Text, TextInput, View, useThemeColors } from "@/tw";

type BookingField =
  | "email"
  | "phone"
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
  email: string;
  errors: Partial<Record<BookingField, string>>;
  exitTime: Date | null;
  licensePlate: string;
  onChangeEmail: (value: string) => void;
  onChangeLicensePlate: (value: string) => void;
  onChangePhone: (value: string) => void;
  onOpenDurationPicker: () => void;
  onOpenPicker: (field: PickerField) => void;
  phone: string;
  selectedDurationHours: number | null;
};

export function BookingFormCard({
  arrivalTime,
  email,
  errors,
  exitTime,
  licensePlate,
  onChangeEmail,
  onChangeLicensePlate,
  onChangePhone,
  onOpenDurationPicker,
  onOpenPicker,
  phone,
  selectedDurationHours,
}: BookingFormCardProps) {
  const { placeholder } = useThemeColors();

  return (
    <View className="gap-3">
      <View className="gap-2">
        <Label>Email</Label>
        <TextInput
          autoCapitalize="none"
          keyboardType="email-address"
          onChangeText={onChangeEmail}
          placeholder="nhapemail@example.com"
          placeholderTextColor={placeholder}
          style={inputStyle}
          value={email}
          className="rounded-[14px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
        />
        {errors.email ? (
          <Text className="font-sans text-sm text-red-400">{errors.email}</Text>
        ) : null}
      </View>

      <View className="gap-2">
        <Label>Số điện thoại</Label>
        <TextInput
          keyboardType="phone-pad"
          onChangeText={onChangePhone}
          placeholder="0901234567"
          placeholderTextColor={placeholder}
          style={inputStyle}
          value={phone}
          className="rounded-[14px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
        />
        {errors.phone ? (
          <Text className="font-sans text-sm text-red-400">{errors.phone}</Text>
        ) : null}
      </View>

      <View className="gap-2">
        <Label>Biển số xe</Label>
        <TextInput
          autoCapitalize="characters"
          onChangeText={onChangeLicensePlate}
          placeholder="59-AB24872"
          placeholderTextColor={placeholder}
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
          <Label>Thời gian đến</Label>
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 rounded-[14px] border border-border-theme bg-input px-4 py-3.5"
              onPress={() => onOpenPicker("arrivalDate")}
              style={inputStyle}
            >
              <Text className="font-sans text-[13px] text-fg">
                {arrivalTime ? formatPickerDate(arrivalTime) : "Chọn ngày"}
              </Text>
            </Pressable>
            <Pressable
              className="flex-1 rounded-[14px] border border-border-theme bg-input px-4 py-3.5"
              onPress={() => onOpenPicker("arrivalTime")}
              style={inputStyle}
            >
              <Text className="font-sans text-[13px] text-fg">
                {arrivalTime ? formatPickerTime(arrivalTime) : "Chọn giờ"}
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
          <Label>Thời gian rời đi</Label>
          <View className="flex-row gap-3">
            <Pressable
              className="flex-1 rounded-[14px] border border-border-theme bg-input px-4 py-3.5"
              onPress={onOpenDurationPicker}
              style={inputStyle}
            >
              <Text className="font-sans text-[13px] text-fg">
                {selectedDurationHours
                  ? formatDurationHours(selectedDurationHours)
                  : "Chọn giờ gửi xe"}
              </Text>
            </Pressable>
            <View
              className="flex-1 rounded-[14px] border border-border-theme bg-input px-4 py-3.5"
              style={inputStyle}
            >
              <Text className="font-sans text-[13px] text-fg">
                {exitTime ? `${formatPickerDate(exitTime)} ${formatPickerTime(exitTime)}` : ""}
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
