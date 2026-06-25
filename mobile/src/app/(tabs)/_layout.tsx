import { Tabs } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useThemeColors } from "../../tw";

const TabsLayout = () => {
  const { borderStrong, fg, tabBar, tabInactive } = useThemeColors();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: fg,
        tabBarInactiveTintColor: tabInactive,
        tabBarStyle: {
          backgroundColor: tabBar,
          borderColor: borderStrong,
          borderWidth: 1,
          borderRadius: 18,
          bottom: 15,
          elevation: 0,
          height: 68,
          left: 12,
          paddingTop: 8,
          position: "absolute",
          right: 12,
        },
        tabBarItemStyle: {
          flex: 1,
        },
        tabBarIconStyle: {
          height: 28,
          width: 32,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "700",
        },
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "home" : "home"} color={color} size={24} />
          ),
          tabBarLabel: "Home",
          title: "Home",
        }}
      />
      <Tabs.Screen
        name="booking"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "calendar" : "calendar"} color={color} size={24} />
          ),
          tabBarLabel: "Booking",
          title: "Booking",
        }}
      />
      <Tabs.Screen
        name="subscription"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "card" : "card-outline"} color={color} size={24} />
          ),
          tabBarLabel: "Subscription",
          title: "Subscription",
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? "person" : "person"} color={color} size={24} />
          ),
          tabBarLabel: "Profile",
          title: "Profile",
        }}
      />
    </Tabs>
  );
};

export default TabsLayout;
