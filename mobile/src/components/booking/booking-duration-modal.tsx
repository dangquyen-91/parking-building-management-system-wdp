import { Modal } from "react-native";

import { formatDurationHours } from "@/utils/format";
import { Pressable, ScrollView, Text, View } from "@/tw";

type BookingDurationModalProps = {
  onClose: () => void;
  onSelectDuration: (hours: number) => void;
  selectedDurationHours: number | null;
  visible: boolean;
};

export function BookingDurationModal({
  onClose,
  onSelectDuration,
  selectedDurationHours,
  visible,
}: BookingDurationModalProps) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end bg-black/60">
        <View className="gap-4 rounded-t-[28px] bg-page px-5 pb-8 pt-5">
          <View className="flex-row items-center justify-between">
            <Text className="font-sans text-lg font-extrabold text-fg">
              Select parking duration
            </Text>
            <Pressable className="rounded-full bg-badge px-4 py-2" onPress={onClose}>
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
                  onPress={() => onSelectDuration(hours)}
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
  );
}
