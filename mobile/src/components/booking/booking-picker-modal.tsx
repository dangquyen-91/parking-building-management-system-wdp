import { useEffect, useRef } from "react";
import DateTimePicker, {
  DateTimePickerAndroid,
  type DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { Modal, Platform } from "react-native";

import { View } from "@/tw";

type PickerField = "arrivalDate" | "arrivalTime" | null;

type BookingPickerModalProps = {
  minimumDate?: Date;
  mode: "date" | "time";
  onChange: (_event: DateTimePickerChangeEvent, selectedDate?: Date) => void;
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
  const onChangeRef = useRef(onChange);
  const onDismissRef = useRef(onDismiss);

  useEffect(() => {
    onChangeRef.current = onChange;
    onDismissRef.current = onDismiss;
  }, [onChange, onDismiss]);

  useEffect(() => {
    if (Platform.OS !== "android" || !pickerField) {
      return;
    }

    DateTimePickerAndroid.open({
      display: "spinner",
      is24Hour: true,
      minuteInterval: 15,
      minimumDate,
      mode,
      onDismiss: () => {
        onDismissRef.current();
      },
      onValueChange: (event, selectedDate) => {
        onChangeRef.current(event, selectedDate);
        onDismissRef.current();
      },
      value,
    });
  }, [minimumDate, mode, pickerField, value]);

  if (Platform.OS === "android") {
    return null;
  }

  return (
    <Modal
      animationType="slide"
      onRequestClose={onDismiss}
      transparent
      visible={Boolean(pickerField)}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="gap-4 rounded-t-[28px] bg-page px-5 pb-8 pt-5">
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
