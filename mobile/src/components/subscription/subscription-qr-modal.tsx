import { GlassCard } from "@/components/parking-ui";
import type { SubscriptionQrResult } from "@/types/subscriptions";
import { Pressable, Text, View } from "@/tw";
import { Image } from "expo-image";
import { Modal } from "react-native";

type SubscriptionQrModalProps = {
  onClose: () => void;
  qrData: SubscriptionQrResult | undefined;
  visible: boolean;
};

export function SubscriptionQrModal({
  onClose,
  qrData,
  visible,
}: SubscriptionQrModalProps) {
  return (
    <Modal animationType="slide" onRequestClose={onClose} transparent visible={visible}>
      <View className="flex-1 justify-end bg-black/60">
        <View className="gap-4 rounded-t-[28px] bg-page px-5 pb-8 pt-5">
          <View className="flex-row items-center justify-between">
            <Text className="font-sans text-lg font-extrabold text-fg">
              Resident entry QR
            </Text>
            <Pressable className="rounded-full bg-badge px-4 py-2" onPress={onClose}>
              <Text className="font-sans text-sm font-bold text-fg">Done</Text>
            </Pressable>
          </View>

          {qrData ? (
            <GlassCard className="items-center gap-3">
              <Image
                contentFit="contain"
                source={{ uri: qrData.qrImage }}
                style={{ width: 260, height: 260 }}
              />
              <Text className="font-sans text-lg font-extrabold text-fg">
                {qrData.licensePlate}
              </Text>
              <Text selectable className="font-sans text-xs text-subtle">
                {qrData.qrToken}
              </Text>
            </GlassCard>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}
