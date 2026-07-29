import { Redirect, Tabs } from "expo-router";
import { ActivityIndicator } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useCurrentUserQuery } from "@/hooks/useAuth";
import { getHomeRouteForRole } from "@/lib/role-navigation";
import { getFloatingTabScreenOptions } from "@/lib/tab-navigation";
import { Text, View, useThemeColors } from "@/tw";

const GuestTabsLayout = () => {
  const { data: currentUser, isLoading } = useCurrentUserQuery();
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

  if (currentUser) {
    return <Redirect href={getHomeRouteForRole(currentUser.role)} />;
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
        name="booking"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="calendar" color={color} size={24} />,
          tabBarLabel: "Đặt chỗ",
          title: "Đặt chỗ",
        }}
      />
    </Tabs>
  );
};

export default GuestTabsLayout;
