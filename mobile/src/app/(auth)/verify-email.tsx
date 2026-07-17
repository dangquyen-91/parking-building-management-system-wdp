import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";

import { AppRefreshControl } from "@/components/common/refresh-control";
import {
  useResendVerificationMutation,
  useVerifyEmailMutation,
} from "@/hooks/useAuth";
import {
  resendVerificationPayloadSchema,
  verifyEmailPayloadSchema,
} from "@/schema";
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

type VerifyEmailField = "email" | "otp";

type VerifyEmailParams = {
  email?: string | string[];
};

const getSingleParam = (value?: string | string[]) =>
  typeof value === "string" ? value : "";

export default function VerifyEmail() {
  const { iconPrimary, placeholder } = useThemeColors();
  const params = useLocalSearchParams<VerifyEmailParams>();
  const routeEmail = getSingleParam(params.email).trim();
  const [email, setEmail] = useState(routeEmail);
  const [otp, setOtp] = useState("");
  const [errors, setErrors] = useState<
    Partial<Record<VerifyEmailField, string>>
  >({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const verifyEmailMutation = useVerifyEmailMutation();
  const resendVerificationMutation = useResendVerificationMutation();

  useEffect(() => {
    if (routeEmail) {
      setEmail(routeEmail);
    }
  }, [routeEmail]);

  const resetFormState = () => {
    setOtp("");
    setErrors({});
  };

  const handleVerifyEmail = async () => {
    const validation = verifyEmailPayloadSchema.safeParse({ email, otp });

    if (!validation.success) {
      setErrors(getFieldErrors<VerifyEmailField>(validation.error));
      return;
    }

    setErrors({});

    try {
      await verifyEmailMutation.mutateAsync(validation.data);
      toast.success("Xác thực email thành công", {
        description: "Bạn có thể đăng nhập bằng tài khoản này.",
      });
      router.replace({
        pathname: "/(auth)/login",
        params: { email: validation.data.email },
      });
    } catch (error) {
      toast.error("Xác thực OTP thất bại", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    }
  };

  const handleResendOtp = async () => {
    const validation = resendVerificationPayloadSchema.safeParse({ email });

    if (!validation.success) {
      setErrors(getFieldErrors<VerifyEmailField>(validation.error));
      return;
    }

    setErrors((current) => ({ ...current, email: undefined }));

    try {
      await resendVerificationMutation.mutateAsync(validation.data);
      toast.success("Đã gửi lại mã OTP", {
        description: "Vui lòng kiểm tra hộp thư email của bạn.",
      });
    } catch (error) {
      toast.info("Chưa thể gửi lại mã OTP", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại sau.",
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
              <Link href="/(auth)/login" asChild>
                <Pressable className="h-11 w-11 items-center justify-center rounded-full border border-border-theme bg-badge">
                  <Ionicons
                    name="chevron-back"
                    color={iconPrimary}
                    size={22}
                  />
                </Pressable>
              </Link>

              <View className="rounded-full bg-badge px-4 py-2.5">
                <Text className="font-sans text-sm font-bold uppercase tracking-[1px] text-fg">
                  OTP Email
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <Text className="font-sans text-xs font-bold uppercase text-faint">
                Xác thực tài khoản
              </Text>
              <Text className="font-sans text-[36px] font-black leading-[41px] text-fg">
                Nhập mã OTP đã gửi tới email
              </Text>
              <Text className="font-sans text-base leading-6 text-subtle">
                Backend yêu cầu xác thực email trước khi đăng nhập. Mã OTP có
                hiệu lực trong 10 phút.
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
                  Mã OTP
                </Text>
                <TextInput
                  autoComplete="one-time-code"
                  keyboardType="number-pad"
                  maxLength={6}
                  onChangeText={(value) => {
                    setOtp(value.replace(/\D/g, "").slice(0, 6));
                    setErrors((current) => ({ ...current, otp: undefined }));
                  }}
                  placeholder="Nhập 6 chữ số"
                  placeholderTextColor={placeholder}
                  textContentType="oneTimeCode"
                  value={otp}
                  className="rounded-[16px] border border-border-theme bg-input py-4 pl-5 pr-4 font-sans text-base tracking-[6px] text-fg"
                />
                {errors.otp ? (
                  <Text className="font-sans text-sm text-red-400">
                    {errors.otp}
                  </Text>
                ) : null}
              </View>

              <View className="rounded-[18px] bg-badge p-4">
                <Text className="font-sans text-sm leading-5 text-subtle">
                  Nếu chưa thấy email, hãy kiểm tra thư mục spam.
                </Text>
              </View>

              <Pressable
                className="items-center rounded-full bg-btn-primary py-4"
                disabled={
                  verifyEmailMutation.isPending ||
                  resendVerificationMutation.isPending
                }
                onPress={handleVerifyEmail}
              >
                <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                  {verifyEmailMutation.isPending
                    ? "Đang xác thực..."
                    : "Xác thực email"}
                </Text>
              </Pressable>

              <Pressable
                className="items-center rounded-full border border-border-strong bg-badge py-4"
                disabled={
                  verifyEmailMutation.isPending ||
                  resendVerificationMutation.isPending
                }
                onPress={handleResendOtp}
              >
                <Text className="font-sans text-base font-extrabold text-fg">
                  {resendVerificationMutation.isPending
                    ? "Đang gửi lại mã..."
                    : "Gửi lại mã OTP"}
                </Text>
              </Pressable>
            </View>
          </View>

          <View className="items-center gap-2">
            <Text className="font-sans text-sm text-subtle">
              Đã xác thực xong?
            </Text>
            <Link
              href={{
                pathname: "/(auth)/login",
                params: { email: email || undefined },
              }}
              asChild
            >
              <Pressable>
                <Text className="font-sans text-sm font-extrabold text-fg">
                  Quay lại đăng nhập
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
}
