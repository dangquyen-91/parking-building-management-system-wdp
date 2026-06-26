import { GlassCard } from "@/components/parking-ui";
import { Link, Pressable, Text, View, useThemeColors } from "@/tw";
import Ionicons from "react-native-vector-icons/Ionicons";

export function SubscriptionGateCard() {
  const { iconPrimary } = useThemeColors();

  return (
    <GlassCard className="gap-4">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-badge">
        <Ionicons name="lock-closed" color={iconPrimary} size={22} />
      </View>
      <View className="gap-1">
        <Text className="font-sans text-xl font-extrabold text-fg">
          Cần đăng nhập
        </Text>
        <Text className="font-sans text-sm leading-5 text-subtle">
          Gói gửi xe cư dân được gắn với tài khoản và biển số xe của bạn.
        </Text>
      </View>
      <Link href="/(auth)/login" asChild>
        <Pressable className="items-center rounded-full bg-btn-primary py-4">
          <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
            Đăng nhập
          </Text>
        </Pressable>
      </Link>
    </GlassCard>
  );
}
