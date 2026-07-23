import { Tabs } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";

import { getFloatingTabScreenOptions } from "@/lib/tab-navigation";
import { useThemeColors } from "@/tw";

const GuestTabsLayout = () => {
  const { borderStrong, fg, tabBar, tabInactive } = useThemeColors();

  return (
    <Tabs screenOptions={getFloatingTabScreenOptions({ borderStrong, fg, tabBar, tabInactive })}>
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
