import { useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router } from "expo-router";
import { toast } from "sonner-native";
import { KeyboardAvoidingView, Platform } from "react-native";

import { AppRefreshControl } from "@/components/common/refresh-control";
import { useRegisterMutation } from "@/hooks/useAuth";
import { registerPayloadSchema } from "@/schema";
import { getFieldErrors } from "@/utils/validation";
import {
  Link,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useThemeColors,
} from "../../tw";

type RegisterField = "fullName" | "email" | "phone" | "password";

export default function Register() {
  const { iconMuted, iconPrimary, placeholder } = useThemeColors();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<RegisterField, string>>>({});
  const registerMutation = useRegisterMutation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const resetFormState = () => {
    setFullName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setShowPassword(false);
    setErrors({});
  };

  const handleRegister = async () => {
    const validation = registerPayloadSchema.safeParse({
      fullName,
      email,
      phone: phone || undefined,
      password,
    });

    if (!validation.success) {
      setErrors(getFieldErrors<RegisterField>(validation.error));
      return;
    }

    setErrors({});

    try {
      await registerMutation.mutateAsync({
        ...validation.data,
        phone: validation.data.phone || undefined,
      });
      toast.success("Tạo tài khoản thành công", {
        description: "Vui lòng đăng nhập bằng tài khoản mới.",
      });
      router.replace("/(auth)/login");
    } catch (error) {
      toast.error("Đăng ký thất bại", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    }
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      resetFormState();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View className="flex-1 bg-page">
        <ScrollView
          automaticallyAdjustKeyboardInsets
          contentInsetAdjustmentBehavior="automatic"
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="gap-8 px-5 pb-10 pt-16"
          refreshControl={
            <AppRefreshControl
              onRefresh={handleRefresh}
              refreshing={isRefreshing}
            />
          }
        >
          <View className="flex-row items-center justify-between">
            <Link href="/(tabs)/home" asChild>
              <Pressable className="h-11 w-11 items-center justify-center rounded-full border border-border-theme bg-badge">
                <Ionicons name="chevron-back" color={iconPrimary} size={22} />
              </Pressable>
            </Link>

            <Link href="/(auth)/login" asChild>
              <Pressable className="min-w-[80px] items-center rounded-full border border-border-strong bg-badge px-4 py-2.5">
                <Text className="font-sans text-sm font-bold text-fg">
                  Đăng nhập
                </Text>
              </Pressable>
            </Link>
          </View>

          <View className="gap-3">
            <Text className="font-sans text-xs font-bold uppercase text-faint">
              Thành viên bãi xe mới
            </Text>
            <Text className="font-sans text-[36px] font-black leading-[41px] text-fg">
              Tạo tài khoản gửi xe
            </Text>
            <Text className="font-sans text-base leading-6 text-subtle">
              Đăng ký để đặt chỗ nhanh hơn, lưu phương tiện và theo dõi các gói gửi xe.
            </Text>
          </View>

          <View className="gap-4 rounded-[22px] border border-border-theme bg-glass-card p-4">
            <View className="gap-2">
              <Text className="font-sans text-sm font-bold text-muted">
                Họ và tên
              </Text>
              <TextInput
                onChangeText={(value) => {
                  setFullName(value);
                  setErrors((current) => ({ ...current, fullName: undefined }));
                }}
                placeholder="Lâm Hoàng"
                placeholderTextColor={placeholder}
                value={fullName}
                className="rounded-[16px] border border-border-theme bg-input py-4 pl-5 pr-4 font-sans text-base text-fg"
              />
              {errors.fullName ? (
                <Text className="font-sans text-sm text-red-400">
                  {errors.fullName}
                </Text>
              ) : null}
            </View>

            <View className="gap-2">
              <Text className="font-sans text-sm font-bold text-muted">
                Email
              </Text>
              <TextInput
                autoCapitalize="none"
                keyboardType="email-address"
                onChangeText={(value) => {
                  setEmail(value);
                  setErrors((current) => ({ ...current, email: undefined }));
                }}
                placeholder="customer@example.com"
                placeholderTextColor={placeholder}
                value={email}
                className="rounded-[16px] border border-border-theme bg-input py-4 pl-5 pr-4 font-sans text-base text-fg"
              />
              {errors.email ? (
                <Text className="font-sans text-sm text-red-400">
                  {errors.email}
                </Text>
              ) : null}
            </View>

            <View className="gap-2">
              <Text className="font-sans text-sm font-bold text-muted">
                Số điện thoại
              </Text>
              <TextInput
                keyboardType="phone-pad"
                onChangeText={(value) => {
                  setPhone(value);
                  setErrors((current) => ({ ...current, phone: undefined }));
                }}
                placeholder="090 000 0000"
                placeholderTextColor={placeholder}
                value={phone}
                className="rounded-[16px] border border-border-theme bg-input py-4 pl-5 pr-4 font-sans text-base text-fg"
              />
              {errors.phone ? (
                <Text className="font-sans text-sm text-red-400">
                  {errors.phone}
                </Text>
              ) : null}
            </View>

            <View className="gap-2">
              <Text className="font-sans text-sm font-bold text-muted">
                Mật khẩu
              </Text>
              <View className="flex-row items-center rounded-[16px] border border-border-theme bg-input">
                <TextInput
                  onChangeText={(value) => {
                    setPassword(value);
                    setErrors((current) => ({ ...current, password: undefined }));
                  }}
                  placeholder="Tạo mật khẩu"
                  placeholderTextColor={placeholder}
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
                    color={iconMuted}
                    size={21}
                  />
                </Pressable>
              </View>
              {errors.password ? (
                <Text className="font-sans text-sm text-red-400">
                  {errors.password}
                </Text>
              ) : null}
            </View>

            <Pressable
              className="items-center rounded-full bg-btn-primary py-4"
              disabled={registerMutation.isPending}
              onPress={handleRegister}
            >
              <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                {registerMutation.isPending ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
              </Text>
            </Pressable>
          </View>

          <View className="rounded-[18px] bg-badge p-4">
            <Text className="font-sans text-sm leading-5 text-subtle">
              Khi đăng ký, bạn đồng ý liên kết phương tiện và thông tin truy cập với hệ thống quản
              lý bãi xe của tòa nhà.
            </Text>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
