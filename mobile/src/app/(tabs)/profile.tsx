import Ionicons from "react-native-vector-icons/Ionicons";
import { useRouter } from "expo-router";
import { toast } from "sonner-native";

import { GlassCard, Label, Page } from "../../components/parking-ui";
import { ThemeToggle } from "../../components/theme-toggle";
import { useCurrentUserQuery, useLogoutMutation } from "../../hooks/useAuth";
import { formatRole } from "@/utils/format";
import { Link, Pressable, ScrollView, Text, View, useThemeColors } from "../../tw";

const getInitials = (name?: string) => {
  if (!name?.trim()) {
    return "U";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export default function Profile() {
  const router = useRouter();
  const { iconPrimary } = useThemeColors();
  const {
    data: currentUser,
    error,
    isLoading,
  } = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();

  const profileItems = currentUser
    ? [
        ["Họ và tên", currentUser.fullName],
        ["Email", currentUser.email],
        ["Số điện thoại", currentUser.phone || "Chưa cập nhật"],
        ["Vai trò", formatRole(currentUser.role)],
        ["Trạng thái", currentUser.isActive ? "Đang hoạt động" : "Ngừng hoạt động"],
      ]
    : [];

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Đăng xuất thành công", {
        description: "Phiên đăng nhập của bạn đã được xóa.",
      });
    } catch {
      toast.info("Đăng xuất thất bại", {
        description: "Đã xảy ra lỗi khi đăng xuất.",
      });
    }
  };

  const handleOpenMySubscription = () => {
    router.push("/subscription/history");
  };

  return (
    <Page
      eyebrow="Tài khoản"
      title={currentUser?.fullName ?? "Hồ sơ"}
      subtitle="Thông tin tài khoản gửi xe của bạn trong hệ thống quản lý tòa nhà."
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-5 pb-[120px]"
      >
        {isLoading ? (
          <GlassCard className="items-center gap-3">
            <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-badge">
              <Ionicons name="person" color={iconPrimary} size={30} />
            </View>
            <Text className="font-sans text-base font-extrabold text-fg">
              Đang tải hồ sơ...
            </Text>
          </GlassCard>
        ) : currentUser ? (
          <>
            <GlassCard className="items-center gap-3">
              <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-btn-primary">
                <Text className="font-sans text-2xl font-black text-btn-primary-fg">
                  {getInitials(currentUser.fullName)}
                </Text>
              </View>
              <View className="items-center gap-1">
                <Text className="font-sans text-xl font-extrabold text-fg">
                  {currentUser.fullName}
                </Text>
                <Text selectable className="font-sans text-sm text-subtle">
                  {currentUser.email}
                </Text>
              </View>
            </GlassCard>

            <GlassCard className="gap-3.5">
              {profileItems.map(([label, value], index) => (
                <View
                  key={label}
                  className={`gap-1 pb-3.5 ${
                    index === profileItems.length - 1
                      ? "border-b-0 pb-0"
                      : "border-b border-border-theme"
                  }`}
                >
                  <Label>{label}</Label>
                  <Text selectable className="font-sans text-base font-bold text-fg">
                    {value}
                  </Text>
                </View>
              ))}
            </GlassCard>

            <Pressable
              className="flex-row items-center justify-between rounded-[28px] border border-border-strong bg-badge px-5 py-4"
              onPress={handleOpenMySubscription}
            >
              <View className="gap-1">
                <Label>Gói gửi xe</Label>
                <Text className="font-sans text-base font-extrabold text-fg">
                  Xem các gói của tôi
                </Text>
              </View>
              <Ionicons name="chevron-forward" color={iconPrimary} size={20} />
            </Pressable>

            <ThemeToggle />

            <View className="gap-3">
              <Pressable
                className="items-center rounded-full bg-btn-primary py-4"
                disabled={logoutMutation.isPending}
                onPress={handleLogout}
              >
                <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                  {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <GlassCard className="gap-4">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-badge">
              <Ionicons name="lock-closed" color={iconPrimary} size={22} />
            </View>
            <View className="gap-1">
              <Text className="font-sans text-xl font-extrabold text-fg">
                Cần đăng nhập
              </Text>
              <Text className="font-sans text-sm leading-5 text-subtle">
                Đăng nhập để xem hồ sơ tài khoản của bạn.
              </Text>
            </View>
            <Link href="/(auth)/login" asChild>
              <Pressable className="items-center rounded-full bg-btn-primary py-4">
                <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                  Đăng nhập
                </Text>
              </Pressable>
            </Link>
            <ThemeToggle />
          </GlassCard>
        )}

        {error ? (
          <GlassCard className="gap-2 border border-border-strong">
            <Text className="font-sans text-sm leading-5 text-subtle">
              {error instanceof Error ? error.message : "Không thể tải hồ sơ."}
            </Text>
          </GlassCard>
        ) : null}
      </ScrollView>
    </Page>
  );
}
