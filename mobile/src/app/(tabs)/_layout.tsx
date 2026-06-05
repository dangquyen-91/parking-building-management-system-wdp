import { Tabs } from "expo-router";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useCSSVariable } from "../../tw";

const TabsLayout = () => {
  const fg = useCSSVariable("--color-fg");
  const border = useCSSVariable("--color-border-strong");

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: fg,
        tabBarInactiveTintColor: "#d1d5db",
        tabBarStyle: {
          backgroundColor: "#2b2b2b",
          borderColor: border,
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
        name="index"
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
