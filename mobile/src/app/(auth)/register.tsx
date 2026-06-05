import Ionicons from "react-native-vector-icons/Ionicons";

import { Link, Pressable, ScrollView, Text, TextInput, View } from "../../tw";

export default function Register() {
  return (
    <View className="flex-1 bg-page">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 px-5 pb-10 pt-16"
      >
        <View className="flex-row items-center justify-between">
          <Link href="/(tabs)" asChild>
            <Pressable className="h-11 w-11 items-center justify-center rounded-full border border-border-theme bg-badge">
              <Ionicons name="chevron-back" color="#ffffff" size={22} />
            </Pressable>
          </Link>

          <Link href="/(auth)/login" asChild>
            <Pressable className="min-w-[80px] items-center rounded-full border border-border-strong bg-badge px-4 py-2.5">
              <Text className="font-sans text-sm font-bold text-fg">
                Sign in
              </Text>
            </Pressable>
          </Link>
        </View>

        <View className="gap-3">
          <Text className="font-sans text-xs font-bold uppercase text-faint">
            New parking member
          </Text>
          <Text className="font-sans text-[36px] font-black leading-[41px] text-fg">
            Create a parking account
          </Text>
          <Text className="font-sans text-base leading-6 text-subtle">
            Register to reserve spaces faster, save vehicles, and track parking
            passes.
          </Text>
        </View>

        <View className="gap-4 rounded-[22px] border border-border-theme bg-glass-card p-4">
          <View className="gap-2">
            <Text className="font-sans text-sm font-bold text-muted">
              Full name
            </Text>
            <TextInput
              placeholder="Lam Hoang"
              placeholderTextColor="#6b7280"
              className="rounded-[16px] border border-border-theme bg-input py-4 pl-5 pr-4 font-sans text-base text-fg"
            />
          </View>

          <View className="gap-2">
            <Text className="font-sans text-sm font-bold text-muted">
              Phone number
            </Text>
            <TextInput
              keyboardType="phone-pad"
              placeholder="090 000 0000"
              placeholderTextColor="#6b7280"
              className="rounded-[16px] border border-border-theme bg-input py-4 pl-5 pr-4 font-sans text-base text-fg"
            />
          </View>

          <View className="gap-2">
            <Text className="font-sans text-sm font-bold text-muted">
              Password
            </Text>
            <TextInput
              placeholder="Create password"
              placeholderTextColor="#6b7280"
              secureTextEntry
              className="rounded-[16px] border border-border-theme bg-input py-4 pl-5 pr-4 font-sans text-base text-fg"
            />
          </View>

          <Pressable className="items-center rounded-full bg-btn-primary py-4">
            <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
              Create account
            </Text>
          </Pressable>
        </View>

        <View className="rounded-[18px] bg-badge p-4">
          <Text className="font-sans text-sm leading-5 text-subtle">
            By registering, you agree to connect your vehicle and access details
            with the building parking management system.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
