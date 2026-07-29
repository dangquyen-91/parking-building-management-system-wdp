import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useCurrentUserQuery } from "@/hooks/useAuth";
import { isStaffRole } from "@/lib/role-navigation";
import { getFloatingTabScreenOptions } from "@/lib/tab-navigation";
import { Text, View, useThemeColors } from "@/tw";

const UserTabsLayout = () => {
  const { data: currentUser, isError, isLoading } = useCurrentUserQuery();
  const { borderStrong, fg, tabBar, tabInactive } = useThemeColors();

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-page px-6">
        <ActivityIndicator />
        <Text className="mt-3 text-center font-sans text-sm font-bold text-subtle">
          Đang kiểm tra phiên đăng nhập...
        </Text>
      </View>
    );
  }

  if (isError || !currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  if (isStaffRole(currentUser.role)) {
    return <Redirect href="/(staff-tabs)/staff-home" />;
  }

  return (
    <Tabs
      screenOptions={getFloatingTabScreenOptions({
        borderStrong,
        fg,
        tabBar,
        tabInactive,
      })}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={24} />,
          tabBarLabel: "Trang chủ",
          title: "Trang chủ",
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "card" : "card-outline"} color={color} size={24} />
          ),
          tabBarLabel: "Gói gửi xe",
          title: "Gói gửi xe",
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar-outline"} color={color} size={24} />
          ),
          tabBarLabel: "Đặt chỗ",
          title: "Đặt chỗ",
        }}
      />
      <Tabs.Screen
        name="complaints"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "warning" : "warning-outline"}
              color={color}
              size={24}
            />
          ),
          tabBarLabel: "Khiếu nại",
          title: "Khiếu nại",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" color={color} size={24} />,
          tabBarLabel: "Hồ sơ",
          title: "Hồ sơ",
        }}
      />
    </Tabs>
  );
};

export default UserTabsLayout;
