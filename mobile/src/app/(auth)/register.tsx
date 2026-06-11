import { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";
import { toast } from "sonner-native";

import { useRegisterMutation } from "@/hooks/useAuth";
import { Link, Pressable, ScrollView, Text, TextInput, View } from "../../tw";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const registerMutation = useRegisterMutation();

  const handleRegister = async () => {
    if (!fullName.trim() || !email.trim() || !password) {
      toast.error("Missing information", {
        description: "Please enter your full name, email, and password.",
      });
      return;
    }

    try {
      await registerMutation.mutateAsync({
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        password,
      });
      toast.success("Account created", {
        description: "Please sign in with your new account.",
      });
      router.replace("/(auth)/login");
    } catch (error) {
      toast.error("Registration failed", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    }
  };

  return (
    <View className="flex-1 bg-page">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-8 px-5 pb-10 pt-16"
      >
        <View className="flex-row items-center justify-between">
          <Link href="/(tabs)/home" asChild>
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
              onChangeText={setFullName}
              placeholder="Lam Hoang"
              placeholderTextColor="#6b7280"
              value={fullName}
              className="rounded-[16px] border border-border-theme bg-input py-4 pl-5 pr-4 font-sans text-base text-fg"
            />
          </View>

          <View className="gap-2">
            <Text className="font-sans text-sm font-bold text-muted">
              Email
            </Text>
            <TextInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChangeText={setEmail}
              placeholder="customer@example.com"
              placeholderTextColor="#6b7280"
              value={email}
              className="rounded-[16px] border border-border-theme bg-input py-4 pl-5 pr-4 font-sans text-base text-fg"
            />
          </View>

          <View className="gap-2">
            <Text className="font-sans text-sm font-bold text-muted">
              Phone number
            </Text>
            <TextInput
              keyboardType="phone-pad"
              onChangeText={setPhone}
              placeholder="090 000 0000"
              placeholderTextColor="#6b7280"
              value={phone}
              className="rounded-[16px] border border-border-theme bg-input py-4 pl-5 pr-4 font-sans text-base text-fg"
            />
          </View>

          <View className="gap-2">
            <Text className="font-sans text-sm font-bold text-muted">
              Password
            </Text>
            <View className="flex-row items-center rounded-[16px] border border-border-theme bg-input">
              <TextInput
                onChangeText={setPassword}
                placeholder="Create password"
                placeholderTextColor="#6b7280"
                secureTextEntry={!showPassword}
                value={password}
                className="min-h-[56px] flex-1 py-4 pl-5 pr-2 font-sans text-base text-fg"
              />
              <Pressable
                className="h-12 w-12 items-center justify-center"
                onPress={() => setShowPassword((value) => !value)}
              >
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  color="#d1d5db"
                  size={21}
                />
              </Pressable>
            </View>
          </View>

          <Pressable
            className="items-center rounded-full bg-btn-primary py-4"
            disabled={registerMutation.isPending}
            onPress={handleRegister}
          >
            <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
              {registerMutation.isPending ? "Creating account..." : "Create account"}
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
