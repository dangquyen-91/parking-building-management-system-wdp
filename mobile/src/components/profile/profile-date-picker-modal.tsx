import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from "@react-native-community/datetimepicker";
import { Modal } from "react-native";

import { View } from "@/tw";

type ProfileDatePickerModalProps = {
  maximumDate?: Date;
  minimumDate?: Date;
  onChange: (_event: DateTimePickerChangeEvent, selectedDate: Date) => void;
  onDismiss: () => void;
  value: Date;
  visible: boolean;
};

export function ProfileDatePickerModal({
  maximumDate,
  minimumDate,
  onChange,
  onDismiss,
  value,
  visible,
}: ProfileDatePickerModalProps) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onDismiss}
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="gap-4 rounded-t-[28px] bg-page px-5 pb-8 pt-5">
          <View className="items-center rounded-[20px] bg-glass-card py-3">
            <DateTimePicker
              display="spinner"
              maximumDate={maximumDate}
              minimumDate={minimumDate}
              mode="date"
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
