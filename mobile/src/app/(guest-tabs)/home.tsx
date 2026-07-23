import Ionicons from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";

import { GlassCard, Label } from "../../components/parking-ui";
import { useCurrentUserQuery, useLogoutMutation } from "../../hooks/useAuth";
import { Link, Pressable, ScrollView, Text, View, useThemeColors } from "../../tw";

const features = [
  {
    icon: "car-sport",
    title: "Theo dõi chỗ trống",
    body: "Cập nhật thời gian thực về tình trạng bãi xe, giúp khách hàng và cư dân dễ dàng tìm chỗ trống.",
  },
  {
    icon: "calendar",
    title: "Đặt chỗ nhanh",
    body: "Đặt chỗ gửi xe cho cư dân, nhân viên, khách và người gửi theo tháng.",
  },
  {
    icon: "card",
    title: "QR và thanh toán",
    body: "Quản lý gói gửi tháng, lượt gửi xe, phương thức thanh toán và biên lai.",
  },
  {
    icon: "shield-checkmark",
    title: "Kiểm soát ra vào",
    body: "Liên kết biển số, thẻ cư dân và quyền truy cập trong cùng một nơi.",
  },
];

export default function Home() {
  const { btnPrimaryFg, iconPrimary } = useThemeColors();
  const { data: currentUser } = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Đăng xuất thành công", {
        description: "Hẹn gặp lại bạn.",
      });
    } catch {
      toast.info("Đăng xuất thất bại", {
        description: "Đã xảy ra lỗi khi đăng xuất.",
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
                <Ionicons name="business" color={btnPrimaryFg} size={24} />
              </View>

              {currentUser ? (
                <View className="max-w-[250px] flex-row items-center gap-2">
                  <View className="max-w-[188px] items-end">
                    <Text
                      numberOfLines={1}
                      className="font-sans text-sm font-extrabold text-fg"
                    >
                      Xin chào, {currentUser.fullName}
                    </Text>
                  </View>
                  <Pressable
                    className="h-10 w-10 items-center justify-center rounded-full border border-border-strong bg-badge"
                    disabled={logoutMutation.isPending}
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out-outline" color={iconPrimary} size={20} />
                  </Pressable>
                </View>
              ) : (
                <View className="flex-row gap-2">
                  <Link href="/(auth)/login" asChild>
                    <Pressable className="min-w-[80px] items-center rounded-full border border-border-strong bg-badge px-4 py-2.5">
                      <Text className="font-sans text-sm font-bold text-fg">
                        Đăng nhập
                      </Text>
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
              )}
            </View>

            <View className="gap-2">
              <Text className="font-sans text-xs font-bold uppercase text-faint">
                Quản lý bãi xe thông minh
              </Text>
              <Text className="font-sans text-[38px] font-black leading-[43px] text-fg">
                Chào mừng đến với hệ thống bãi xe
              </Text>
              <Text className="font-sans text-base leading-6 text-subtle">
                Ứng dụng di động giúp khách hàng đặt chỗ, kiểm tra tình trạng bãi xe và quản lý
                phương tiện thuận tiện hơn.
              </Text>
            </View>
          </View>

          <View className="gap-3">
            <Link href={currentUser ? "/(user-tabs)/booking" : "/(guest-tabs)/booking"} asChild>
              <Pressable className="items-center rounded-full bg-btn-primary py-4">
                <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                  Đặt chỗ gửi xe
                </Text>
              </Pressable>
            </Link>

            <Link href="/(user-tabs)/subscription" asChild>
              <Pressable className="items-center rounded-full border border-border-strong bg-badge py-4">
                <Text className="font-sans text-base font-extrabold text-fg">
                  Gói gửi xe cư dân
                </Text>
              </Pressable>
            </Link>

            <Link href="/(user-tabs)/profile" asChild>
              <Pressable className="items-center rounded-full border border-border-strong bg-badge py-4">
                <Text className="font-sans text-base font-extrabold text-fg">
                  Xem hồ sơ gửi xe
                </Text>
              </Pressable>
            </Link>
          </View>
        </View>

        <View className="gap-3">
          <View className="gap-1">
            <Label>Tính năng chính</Label>
            <Text className="font-sans text-2xl font-black text-fg">
              Dành cho khách và cư dân
            </Text>
          </View>

          {features.map((feature) => (
            <GlassCard key={feature.title} className="flex-row gap-4">
              <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-btn-primary">
                <Ionicons name={feature.icon} color={btnPrimaryFg} size={22} />
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
