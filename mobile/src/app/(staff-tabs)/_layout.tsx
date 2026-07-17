import { Redirect, Tabs } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useCurrentUserQuery } from "@/hooks/useAuth";
import { isStaffRole } from "@/lib/role-navigation";
import { getFloatingTabScreenOptions } from "@/lib/tab-navigation";
import { useThemeColors } from "@/tw";

const StaffTabsLayout = () => {
  const { data: currentUser, isLoading } = useCurrentUserQuery();
  const { borderStrong, fg, tabBar, tabInactive } = useThemeColors();

  if (isLoading) {
    return null;
  }

  if (!currentUser) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!isStaffRole(currentUser.role)) {
    return <Redirect href="/(tabs)/home" />;
  }

  return (
    <Tabs screenOptions={getFloatingTabScreenOptions({ borderStrong, fg, tabBar, tabInactive })}>
      <Tabs.Screen
        name="staff-home"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="home" color={color} size={24} />,
          tabBarLabel: "Trang chủ",
          title: "Trang chủ",
        }}
      />
      <Tabs.Screen
        name="staff-operations"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? "chatbubble-ellipses" : "chatbubble-ellipses-outline"}
              color={color}
              size={24}
            />
          ),
          tabBarLabel: "Khiếu nại",
          title: "Khiếu nại",
        }}
      />
      <Tabs.Screen
        name="staff-profile"
        options={{
          tabBarIcon: ({ color }) => <Ionicons name="person" color={color} size={24} />,
          tabBarLabel: "Hồ sơ",
          title: "Hồ sơ",
        }}
      />
    </Tabs>
  );
};

export default StaffTabsLayout;
