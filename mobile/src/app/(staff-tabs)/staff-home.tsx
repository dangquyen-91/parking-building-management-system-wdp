import type { Href } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";

import { GlassCard, Label, Page } from "@/components/parking-ui";
import { useCurrentUserQuery } from "@/hooks/useAuth";
import { formatRole } from "@/utils/format";
import { Link, Pressable, ScrollView, Text, View, useThemeColors } from "@/tw";

const quickActions: Array<{
  description: string;
  href: Href;
  icon: string;
  title: string;
}> = [
  {
    description: "Theo dõi khiếu nại đỗ sai chỗ, gọi đúng chủ xe và cập nhật xử lý ngay trên mobile.",
    href: "/(staff-tabs)/staff-operations",
    icon: "chatbubble-ellipses",
    title: "Mở khu xử lý khiếu nại",
  },
  {
    description: "Cập nhật thông tin cá nhân và quản lý phiên đăng nhập.",
    href: "/(staff-tabs)/staff-profile",
    icon: "person-circle",
    title: "Mở hồ sơ nhân viên",
  },
];

export default function StaffHome() {
  const { btnPrimaryFg } = useThemeColors();
  const { data: currentUser } = useCurrentUserQuery();

  return (
    <Page
      eyebrow="Nhân viên"
      title="Bảng điều khiển ca trực"
      subtitle="Điểm vào nhanh cho các thao tác tại cổng và công việc vận hành bãi xe."
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-5 pb-[120px]"
      >
        <GlassCard className="gap-4">
          <View className="flex-row items-start justify-between gap-3">
            <View className="flex-1 gap-2">
              <Label>Ca trực hiện tại</Label>
              <Text className="font-sans text-2xl font-extrabold text-fg">
                {currentUser?.fullName ?? "Nhân viên bãi xe"}
              </Text>
              <Text className="font-sans text-sm leading-5 text-subtle">
                {currentUser?.role
                  ? `${formatRole(currentUser.role)} đang sẵn sàng hỗ trợ cư dân và xử lý sự cố đỗ sai chỗ.`
                  : "Đăng nhập để bắt đầu phiên làm việc của bạn."}
              </Text>
            </View>

            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-btn-primary">
              <Ionicons name="shield-checkmark" color={btnPrimaryFg} size={24} />
            </View>
          </View>
        </GlassCard>

        <View className="gap-3">
          <View className="gap-1">
            <Label>Lối tắt</Label>
            <Text className="font-sans text-2xl font-black text-fg">
              Các thao tác nhanh
            </Text>
          </View>

          {quickActions.map((action) => (
            <Link key={action.title} href={action.href} asChild>
              <Pressable className="rounded-[24px] border border-border-strong bg-badge p-5">
                <View className="gap-4">
                  <View className="h-11 w-11 items-center justify-center rounded-[14px] bg-btn-primary">
                    <Ionicons name={action.icon} color={btnPrimaryFg} size={22} />
                  </View>

                  <View className="gap-1">
                    <Text className="font-sans text-base font-extrabold text-fg">
                      {action.title}
                    </Text>
                    <Text className="font-sans text-sm leading-5 text-subtle">
                      {action.description}
                    </Text>
                  </View>
                </View>
              </Pressable>
            </Link>
          ))}
        </View>
      </ScrollView>
    </Page>
  );
}
