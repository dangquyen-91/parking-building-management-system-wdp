import Ionicons from "react-native-vector-icons/Ionicons";

import { GlassCard } from "@/components/parking-ui";
import { Text, View } from "@/tw";

type ProfileLoadingCardProps = {
  iconColor: string;
};

export function ProfileLoadingCard({ iconColor }: ProfileLoadingCardProps) {
  return (
    <GlassCard className="items-center gap-3">
      <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-badge">
        <Ionicons name="person" color={iconColor} size={30} />
      </View>
      <Text className="font-sans text-base font-extrabold text-fg">
        Đang tải hồ sơ...
      </Text>
    </GlassCard>
  );
}
