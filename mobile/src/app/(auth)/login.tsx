import Ionicons from "react-native-vector-icons/Ionicons";

import { Link, Pressable, ScrollView, Text, TextInput, View } from "../../tw";

export default function Login() {
  return (
    <View className="flex-1 bg-page">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="min-h-full justify-between gap-8 px-5 pb-10 pt-16"
      >
        <View className="gap-8">
          <View className="flex-row items-center justify-between">
            <Link href="/(tabs)" asChild>
              <Pressable className="h-11 w-11 items-center justify-center rounded-full border border-border-theme bg-badge">
                <Ionicons name="chevron-back" color="#ffffff" size={22} />
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

          <View className="gap-3">
            <Text className="font-sans text-xs font-bold uppercase text-faint">
              Parking account
            </Text>
            <Text className="font-sans text-[36px] font-black leading-[41px] text-fg">
              Sign in to your account
            </Text>
            <Text className="font-sans text-base leading-6 text-subtle">
              Access your parking profile, reservations, vehicles, and building
              credentials.
            </Text>
          </View>

          <View className="gap-4 rounded-[22px] border border-border-theme bg-glass-card p-4">
            <View className="gap-2">
              <Text className="font-sans text-sm font-bold text-muted">
                Email or phone number
              </Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                placeholder="customer@example.com"
                placeholderTextColor="#6b7280"
                className="rounded-[16px] border border-border-theme bg-input py-4 pl-5 pr-4 font-sans text-base text-fg"
              />
            </View>

            <View className="gap-2">
              <Text className="font-sans text-sm font-bold text-muted">
                Password
              </Text>
              <TextInput
                placeholder="Enter password"
                placeholderTextColor="#6b7280"
                secureTextEntry
                className="rounded-[16px] border border-border-theme bg-input py-4 pl-5 pr-4 font-sans text-base text-fg"
              />
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="font-sans text-sm text-subtle">Remember me</Text>
              <Text className="font-sans text-sm font-bold text-fg">
                Forgot password?
              </Text>
            </View>

            <Pressable className="items-center rounded-full bg-btn-primary py-4">
              <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                Sign in
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="items-center gap-2">
          <Text className="font-sans text-sm text-subtle">
            Do not have an account?
          </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text className="font-sans text-sm font-extrabold text-fg">
                Create a customer account
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}
