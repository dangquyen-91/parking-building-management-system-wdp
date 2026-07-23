import { useEffect, useState } from "react";
import { KeyboardAvoidingView, Platform } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";

import { AppRefreshControl } from "@/components/common/refresh-control";
import {
  useForgotPasswordMutation,
  useResetPasswordMutation,
} from "@/hooks/useAuth";
import {
  forgotPasswordPayloadSchema,
  resetPasswordPayloadSchema,
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

type ForgotPasswordStep = "request" | "otp" | "password";
type ForgotPasswordField = "email" | "otp" | "newPassword" | "confirmPassword";

type ForgotPasswordParams = {
  email?: string | string[];
};

const getSingleParam = (value?: string | string[]) =>
  typeof value === "string" ? value : "";

export default function ForgotPassword() {
  const { iconMuted, iconPrimary, placeholder } = useThemeColors();
  const params = useLocalSearchParams<ForgotPasswordParams>();
  const routeEmail = getSingleParam(params.email).trim();
  const [step, setStep] = useState<ForgotPasswordStep>("request");
  const [email, setEmail] = useState(routeEmail);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<ForgotPasswordField, string>>
  >({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const forgotPasswordMutation = useForgotPasswordMutation();
  const resetPasswordMutation = useResetPasswordMutation();
  const isSubmitting =
    forgotPasswordMutation.isPending || resetPasswordMutation.isPending;

  useEffect(() => {
    if (routeEmail) {
      setEmail(routeEmail);
    }
  }, [routeEmail]);

  const resetFormState = () => {
    setStep("request");
    setOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setErrors({});
  };

  const handleRequestOtp = async () => {
    const validation = forgotPasswordPayloadSchema.safeParse({ email });

    if (!validation.success) {
      setErrors(getFieldErrors<ForgotPasswordField>(validation.error));
      return;
    }

    setErrors({});

    try {
      await forgotPasswordMutation.mutateAsync(validation.data);
      toast.success("Đã gửi mã OTP", {
        description: "Nếu email tồn tại, mã OTP sẽ được gửi tới hộp thư của bạn.",
      });
      setStep("otp");
    } catch (error) {
      toast.error("Chưa thể gửi mã OTP", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
    }
  };

  const handleConfirmOtp = () => {
    const normalizedOtp = otp.trim();

    if (!/^\d{6}$/.test(normalizedOtp)) {
      setErrors((current) => ({
        ...current,
        otp: "Mã OTP phải gồm đúng 6 chữ số.",
      }));
      return;
    }

    setOtp(normalizedOtp);
    setErrors((current) => ({ ...current, otp: undefined }));
    setStep("password");
  };

  const handleResetPassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrors((current) => ({
        ...current,
        confirmPassword: "Mật khẩu xác nhận không khớp.",
      }));
      return;
    }

    const validation = resetPasswordPayloadSchema.safeParse({
      email,
      otp,
      newPassword,
    });

    if (!validation.success) {
      setErrors(getFieldErrors<ForgotPasswordField>(validation.error));
      return;
    }

    setErrors({});

    try {
      await resetPasswordMutation.mutateAsync(validation.data);
      toast.success("Đặt lại mật khẩu thành công", {
        description: "Vui lòng đăng nhập lại bằng mật khẩu mới.",
      });
      router.replace({
        pathname: "/(auth)/login",
        params: { email: validation.data.email },
      });
    } catch (error) {
      toast.error("Đặt lại mật khẩu thất bại", {
        description: error instanceof Error ? error.message : "Vui lòng thử lại.",
      });
      setStep("otp");
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

  const title =
    step === "request"
      ? "Lấy lại mật khẩu tài khoản"
      : step === "otp"
        ? "Nhập mã OTP trong email"
        : "Tạo mật khẩu mới";

  const description =
    step === "request"
      ? "Nhập email đã đăng ký. Hệ thống sẽ gửi mã OTP đặt lại mật khẩu nếu tài khoản hợp lệ."
      : step === "otp"
        ? "Mã OTP có hiệu lực trong 10 phút. Hãy kiểm tra cả thư mục spam nếu chưa thấy email."
        : "Mật khẩu mới cần có ít nhất 8 ký tự để bảo vệ tài khoản của bạn.";

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
                <Text className="font-sans text-sm font-bold uppercase text-fg">
                  Reset
                </Text>
              </View>
            </View>

            <View className="gap-3">
              <Text className="font-sans text-xs font-bold uppercase text-faint">
                Quên mật khẩu
              </Text>
              <Text className="font-sans text-[36px] font-black leading-[41px] text-fg">
                {title}
              </Text>
              <Text className="font-sans text-base leading-6 text-subtle">
                {description}
              </Text>
            </View>

            <View className="gap-4 rounded-[22px] border border-border-theme bg-glass-card p-4">
              <View className="gap-2">
                <Text className="font-sans text-sm font-bold text-muted">
                  Email
                </Text>
                <TextInput
                  autoCapitalize="none"
                  editable={!isSubmitting && step === "request"}
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

              {(step === "otp" || step === "password") && (
                <View className="gap-2">
                  <Text className="font-sans text-sm font-bold text-muted">
                    Mã OTP
                  </Text>
                  <TextInput
                    autoComplete="one-time-code"
                    editable={!isSubmitting && step === "otp"}
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
              )}

              {step === "password" && (
                <>
                  <View className="gap-2">
                    <Text className="font-sans text-sm font-bold text-muted">
                      Mật khẩu mới
                    </Text>
                    <View className="flex-row items-center rounded-[16px] border border-border-theme bg-input">
                      <TextInput
                        onChangeText={(value) => {
                          setNewPassword(value);
                          setErrors((current) => ({
                            ...current,
                            newPassword: undefined,
                          }));
                        }}
                        placeholder="Nhập mật khẩu mới"
                        placeholderTextColor={placeholder}
                        secureTextEntry={!showNewPassword}
                        value={newPassword}
                        className="min-h-[56px] flex-1 py-4 pl-5 pr-2 font-sans text-base text-fg"
                      />
                      <Pressable
                        className="h-12 w-12 items-center justify-center"
                        onPress={() => setShowNewPassword((value) => !value)}
                      >
                        <Ionicons
                          name={showNewPassword ? "eye-off-outline" : "eye-outline"}
                          color={iconMuted}
                          size={21}
                        />
                      </Pressable>
                    </View>
                    {errors.newPassword ? (
                      <Text className="font-sans text-sm text-red-400">
                        {errors.newPassword}
                      </Text>
                    ) : null}
                  </View>

                  <View className="gap-2">
                    <Text className="font-sans text-sm font-bold text-muted">
                      Xác nhận mật khẩu
                    </Text>
                    <View className="flex-row items-center rounded-[16px] border border-border-theme bg-input">
                      <TextInput
                        onChangeText={(value) => {
                          setConfirmPassword(value);
                          setErrors((current) => ({
                            ...current,
                            confirmPassword: undefined,
                          }));
                        }}
                        placeholder="Nhập lại mật khẩu mới"
                        placeholderTextColor={placeholder}
                        secureTextEntry={!showConfirmPassword}
                        value={confirmPassword}
                        className="min-h-[56px] flex-1 py-4 pl-5 pr-2 font-sans text-base text-fg"
                      />
                      <Pressable
                        className="h-12 w-12 items-center justify-center"
                        onPress={() =>
                          setShowConfirmPassword((value) => !value)
                        }
                      >
                        <Ionicons
                          name={
                            showConfirmPassword
                              ? "eye-off-outline"
                              : "eye-outline"
                          }
                          color={iconMuted}
                          size={21}
                        />
                      </Pressable>
                    </View>
                    {errors.confirmPassword ? (
                      <Text className="font-sans text-sm text-red-400">
                        {errors.confirmPassword}
                      </Text>
                    ) : null}
                  </View>
                </>
              )}

              <Pressable
                className="items-center rounded-full bg-btn-primary py-4"
                disabled={isSubmitting}
                onPress={
                  step === "request"
                    ? handleRequestOtp
                    : step === "otp"
                      ? handleConfirmOtp
                      : handleResetPassword
                }
              >
                <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                  {isSubmitting
                    ? "Đang xử lý..."
                    : step === "request"
                      ? "Gửi mã OTP"
                      : step === "otp"
                        ? "Tiếp tục"
                        : "Đặt lại mật khẩu"}
                </Text>
              </Pressable>

              {step !== "request" && (
                <Pressable
                  className="items-center rounded-full border border-border-strong bg-badge py-4"
                  disabled={isSubmitting}
                  onPress={handleRequestOtp}
                >
                  <Text className="font-sans text-base font-extrabold text-fg">
                    Gửi lại mã OTP
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          <View className="items-center gap-2">
            <Text className="font-sans text-sm text-subtle">
              Đã nhớ mật khẩu?
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
