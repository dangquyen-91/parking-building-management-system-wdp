import Ionicons from "react-native-vector-icons/Ionicons";

import { Label } from "@/components/parking-ui";
import { Pressable, Text, View } from "@/tw";

type ProfileSubscriptionCardProps = {
  iconColor: string;
  onPress: () => void;
};

export function ProfileSubscriptionCard({
  iconColor,
  onPress,
}: ProfileSubscriptionCardProps) {
  return (
    <Pressable
      className="flex-row items-center justify-between rounded-[28px] border border-border-strong bg-badge px-5 py-4"
      onPress={onPress}
    >
      <View className="gap-1">
        <Label>Gói gửi xe</Label>
        <Text className="font-sans text-base font-extrabold text-fg">
          Xem các gói của tôi
        </Text>
      </View>
      <Ionicons name="chevron-forward" color={iconColor} size={20} />
    </Pressable>
  );
}
