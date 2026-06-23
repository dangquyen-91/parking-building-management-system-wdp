import { GlassCard } from "@/components/parking-ui";
import { Link, Pressable, Text, View } from "@/tw";
import Ionicons from "react-native-vector-icons/Ionicons";

export function SubscriptionGateCard() {
  return (
    <GlassCard className="gap-4">
      <View className="h-12 w-12 items-center justify-center rounded-full bg-badge">
        <Ionicons name="lock-closed" color="#ffffff" size={22} />
      </View>
      <View className="gap-1">
        <Text className="font-sans text-xl font-extrabold text-fg">
          Sign in required
        </Text>
        <Text className="font-sans text-sm leading-5 text-subtle">
          Resident subscriptions are attached to your account and vehicle plate.
        </Text>
      </View>
      <Link href="/(auth)/login" asChild>
        <Pressable className="items-center rounded-full bg-btn-primary py-4">
          <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
            Sign in
          </Text>
        </Pressable>
      </Link>
    </GlassCard>
  );
}
