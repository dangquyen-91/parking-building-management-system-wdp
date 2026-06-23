import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { Modal } from "react-native";

import { Pressable, Text, View } from "@/tw";

type PickerField = "arrivalDate" | "arrivalTime" | null;

type BookingPickerModalProps = {
  minimumDate?: Date;
  mode: "date" | "time";
  onChange: (_event: DateTimePickerChangeEvent, selectedDate: Date) => void;
  onDismiss: () => void;
  pickerField: PickerField;
  value: Date;
};

export function BookingPickerModal({
  minimumDate,
  mode,
  onChange,
  onDismiss,
  pickerField,
  value,
}: BookingPickerModalProps) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onDismiss}
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
            <Pressable className="rounded-full bg-badge px-4 py-2" onPress={onDismiss}>
              <Text className="font-sans text-sm font-bold text-fg">Done</Text>
            </Pressable>
          </View>

          <View className="items-center rounded-[20px] bg-glass-card py-3">
            <DateTimePicker
              display="spinner"
              minuteInterval={15}
              minimumDate={minimumDate}
              mode={mode}
              onDismiss={onDismiss}
              onValueChange={onChange}
              value={value}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}
