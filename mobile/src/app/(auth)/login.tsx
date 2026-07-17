import { useEffect, useState } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import { toast } from "sonner-native";
import { AppRefreshControl } from "@/components/common/refresh-control";
import { useLoginMutation } from "@/hooks/useAuth";
import { ApiError } from "@/lib/api";
import { getHomeRouteForRole } from "@/lib/role-navigation";
import { loginPayloadSchema } from "@/schema";
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

type LoginField = "email" | "password";

type LoginParams = {
  email?: string | string[];
};

const getSingleParam = (value?: string | string[]) =>
  typeof value === "string" ? value : "";

const isEmailVerificationRequiredError = (error: unknown) => {
  if (!(error instanceof ApiError) || error.status !== 403) {
    return false;
  }

  const normalizedMessage = error.message.toLowerCase();
  return (
    normalizedMessage.includes("xác thực") ||
    normalizedMessage.includes("verify") ||
    normalizedMessage.includes("otp")
  );
};

export default function Login() {
  const { iconMuted, iconPrimary, placeholder } = useThemeColors();
  const params = useLocalSearchParams<LoginParams>();
  const routeEmail = getSingleParam(params.email).trim();
  const [email, setEmail] = useState(routeEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<LoginField, string>>>({});
  const loginMutation = useLoginMutation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (routeEmail) {
      setEmail(routeEmail);
    }
  }, [routeEmail]);

  const resetFormState = () => {
    setEmail(routeEmail);
    setPassword("");
    setShowPassword(false);
    setErrors({});
  };

  const handleLogin = async () => {
    const validation = loginPayloadSchema.safeParse({ email, password });

    if (!validation.success) {
      setErrors(getFieldErrors<LoginField>(validation.error));
      return;
    }

    setErrors({});

    try {
      const session = await loginMutation.mutateAsync(validation.data);
      toast.success("Đăng nhập thành công", {
        description: "Chào mừng bạn quay trở lại.",
      });
      router.replace(getHomeRouteForRole(session.user.role));
    } catch (error) {
      if (isEmailVerificationRequiredError(error)) {
        toast.info("Email chưa được xác thực", {
          description: "Nhập mã OTP để hoàn tất xác thực rồi đăng nhập lại.",
        });
        router.push({
          pathname: "/(auth)/verify-email",
          params: { email: validation.data.email },
        });
        return;
      }

      toast.error("Đăng nhập thất bại", {
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
    <View className="flex-1 bg-page">
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="min-h-full justify-between gap-8 px-5 pb-10 pt-16"
        refreshControl={
          <AppRefreshControl
            onRefresh={handleRefresh}
            refreshing={isRefreshing}
          />
        }
      >
        <View className="gap-8">
          <View className="flex-row items-center justify-between">
            <Link href="/(tabs)/home" asChild>
              <Pressable className="h-11 w-11 items-center justify-center rounded-full border border-border-theme bg-badge">
                <Ionicons name="chevron-back" color={iconPrimary} size={22} />
              </Pressable>
            </Link>

            <Link href="/(auth)/register" asChild>
              <Pressable className="min-w-[84px] items-center rounded-full bg-btn-primary px-4 py-2.5">
                <Text className="font-sans text-sm font-bold text-btn-primary-fg">
                  Đăng ký
                </Text>
              </Pressable>
            </Link>
          </View>

          <View className="gap-3">
            <Text className="font-sans text-xs font-bold uppercase text-faint">
              Tài khoản
            </Text>
            <Text className="font-sans text-[36px] font-black leading-[41px] text-fg">
              Đăng nhập vào tài khoản của bạn
            </Text>
            <Text className="font-sans text-base leading-6 text-subtle">
              Truy cập hồ sơ gửi xe, lịch đặt chỗ, phương tiện và quyền ra vào tòa nhà.
            </Text>
          </View>

          <View className="gap-4 rounded-[22px] border border-border-theme bg-glass-card p-4">
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
                Mật khẩu
              </Text>
              <View className="flex-row items-center rounded-[16px] border border-border-theme bg-input">
                <TextInput
                  onChangeText={(value) => {
                    setPassword(value);
                    setErrors((current) => ({ ...current, password: undefined }));
                  }}
                  placeholder="Nhập mật khẩu"
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

            <View className="flex-row items-center justify-between">
              <Text className="font-sans text-sm font-bold text-fg">
                Quên mật khẩu
              </Text>
            </View>

            <Pressable
              className="items-center rounded-full bg-btn-primary py-4"
              disabled={loginMutation.isPending}
              onPress={handleLogin}
            >
              <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                {loginMutation.isPending ? "Đang đăng nhập..." : "Đăng nhập"}
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="items-center gap-2">
          <Text className="font-sans text-sm text-subtle">
            Chưa có tài khoản?
          </Text>
          <Link href="/(auth)/register" asChild>
            <Pressable>
              <Text className="font-sans text-sm font-extrabold text-fg">
                Tạo tài khoản
              </Text>
            </Pressable>
          </Link>
        </View>
      </ScrollView>
    </View>
  );
}
