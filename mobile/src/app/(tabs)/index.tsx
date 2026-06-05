import Ionicons from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";

import { GlassCard, Label } from "../../components/parking-ui";
import { useCurrentUserQuery, useLogoutMutation } from "../../hooks/useAuth";
import { Link, Pressable, ScrollView, Text, View } from "../../tw";

const features = [
  {
    icon: "car-sport",
    title: "Space monitoring",
    body: "Track available spaces by zone in real time before customers arrive.",
  },
  {
    icon: "calendar",
    title: "Fast reservations",
    body: "Reserve parking for residents, employees, visitors, and monthly tenants.",
  },
  {
    icon: "card",
    title: "Tickets and payments",
    body: "Manage monthly passes, parking sessions, payment methods, and receipts.",
  },
  {
    icon: "shield-checkmark",
    title: "Access control",
    body: "Connect license plates, resident cards, and access permissions in one place.",
  },
];

export default function Home() {
  const { data: currentUser } = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out", {
        description: "Your session has been cleared.",
      });
    } catch {
      toast.info("Logged out", {
        description: "Your local session has been cleared.",
      });
    }
  };

  return (
    <View className="flex-1 bg-page">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-6 px-5 pb-[128px] pt-16"
      >
        <View className="gap-5">
          <View className="gap-3">
            <View className="flex-row items-center justify-between gap-3">
              <View className="h-12 w-12 items-center justify-center rounded-2xl bg-btn-primary">
                <Ionicons name="business" color="#000000" size={24} />
              </View>

              {currentUser ? (
                <View className="max-w-[250px] flex-row items-center gap-2">
                  <View className="max-w-[188px] items-end">
                    <Text
                      numberOfLines={1}
                      className="font-sans text-sm font-extrabold text-fg"
                    >
                      Hello, {currentUser.fullName}
                    </Text>
                  </View>
                  <Pressable
                    className="h-10 w-10 items-center justify-center rounded-full border border-border-strong bg-badge"
                    disabled={logoutMutation.isPending}
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out-outline" color="#ffffff" size={20} />
                  </Pressable>
                </View>
              ) : (
                <View className="flex-row gap-2">
                  <Link href="/(auth)/login" asChild>
                    <Pressable className="min-w-[80px] items-center rounded-full border border-border-strong bg-badge px-4 py-2.5">
                      <Text className="font-sans text-sm font-bold text-fg">
                        Sign in
                      </Text>
                    </Pressable>
                  </Link>
                  <Link href="/(auth)/register" asChild>
                    <Pressable className="min-w-[84px] items-center rounded-full bg-btn-primary px-4 py-2.5">
                      <Text className="font-sans text-sm font-bold text-btn-primary-fg">
                        Register
                      </Text>
                    </Pressable>
                  </Link>
                </View>
              )}
            </View>

            <View className="gap-2">
              <Text className="font-sans text-xs font-bold uppercase text-faint">
                Parking building management
              </Text>
              <Text className="font-sans text-[38px] font-black leading-[43px] text-fg">
                Welcome to your parking system
              </Text>
              <Text className="font-sans text-base leading-6 text-subtle">
                A mobile experience for customers to reserve spaces, check
                parking status, and manage vehicle access with less friction.
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <Link href="/(tabs)/booking" asChild>
              <Pressable className="items-center rounded-full bg-btn-primary py-4">
                <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                  Book a space
                </Text>
              </Pressable>
            </Link>

            <Link href="/(tabs)/profile" asChild>
              <Pressable className="items-center rounded-full border border-border-strong bg-badge py-4">
                <Text className="font-sans text-base font-extrabold text-fg">
                  View parking profile
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <GlassCard className="gap-4">
          <View className="flex-row items-center justify-between">
            <View className="gap-1">
              <Label>Today overview</Label>
              <Text className="font-sans text-xl font-extrabold text-fg">
                Parking is running smoothly
              </Text>
            </View>
            <View className="h-11 w-11 items-center justify-center rounded-full bg-badge">
              <Ionicons name="analytics" color="#ffffff" size={22} />
            </View>
          </View>

          <View className="h-2.5 overflow-hidden rounded-full bg-badge">
            <View className="h-full w-[72%] bg-btn-primary" />
          </View>

          <View className="flex-row gap-3">
            {[
              ["318", "Total slots"],
              ["66", "Open now"],
              ["24/7", "Monitoring"],
            ].map(([value, label]) => (
              <View key={label} className="flex-1 gap-1 rounded-[14px] bg-surface-alt p-3">
                <Text selectable className="font-sans text-xl font-black text-fg">
                  {value}
                </Text>
                <Text className="font-sans text-xs text-subtle">{label}</Text>
              </View>
            ))}
          </View>
        </GlassCard>

        <View className="gap-3">
          <View className="gap-1">
            <Label>Core features</Label>
            <Text className="font-sans text-2xl font-black text-fg">
              Built for parking customers
            </Text>
          </View>

          {features.map((feature) => (
            <GlassCard key={feature.title} className="flex-row gap-4">
              <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-btn-primary">
                <Ionicons name={feature.icon} color="#000000" size={22} />
              </View>
              <View className="flex-1 gap-1">
                <Text className="font-sans text-base font-extrabold text-fg">
                  {feature.title}
                </Text>
                <Text className="font-sans text-sm leading-5 text-subtle">
                  {feature.body}
                </Text>
              </View>
            </GlassCard>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
