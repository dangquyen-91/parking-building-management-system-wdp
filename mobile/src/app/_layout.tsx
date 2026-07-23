import "@/global.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { StatusBar } from "expo-status-bar";
import { Stack } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, View as NativeView } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Toaster } from "sonner-native";
import { ThemeProvider, useAppTheme } from "../providers/theme-provider";
import { Text, View } from "../tw";

const toastIconColors = {
  success: "#4ade80",
  error: "#f87171",
  info: "#60a5fa",
  warning: "#fbbf24",
};

const ToastStatusIcon = ({
  color,
  name,
}: {
  color: string;
  name: React.ComponentProps<typeof Ionicons>["name"];
}) => (
  <NativeView
    style={{
      alignItems: "center",
      height: 20,
      justifyContent: "center",
      marginTop: 1,
      width: 20,
    }}
  >
    <Ionicons color={color} name={name} size={19} />
  </NativeView>
);

function AppShell({ queryClient }: { queryClient: QueryClient }) {
  const { colorScheme } = useAppTheme();

  return (
    <QueryClientProvider client={queryClient}>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }} />
      <Toaster
        icons={{
          error: (
            <ToastStatusIcon
              color={toastIconColors.error}
              name="close-circle-outline"
            />
          ),
          info: (
            <ToastStatusIcon
              color={toastIconColors.info}
              name="information-circle-outline"
            />
          ),
          success: (
            <ToastStatusIcon
              color={toastIconColors.success}
              name="checkmark-circle-outline"
            />
          ),
          warning: (
            <ToastStatusIcon
              color={toastIconColors.warning}
              name="warning-outline"
            />
          ),
        }}
        position="top-center"
        richColors
        theme={colorScheme}
        toastOptions={{
          toastContentStyle: {
            alignItems: "flex-start",
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default function RootLayout() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 1000 * 60 * 5,
          },
          mutations: {
            retry: 0,
          },
        },
      }),
  );
  const [fontsLoaded] = useFonts({
    Ionicons: require("react-native-vector-icons/Fonts/Ionicons.ttf"),
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-page px-6">
        <ActivityIndicator />
        <Text className="mt-3 text-center font-sans text-sm font-bold text-subtle">
          Đang tải ứng dụng...
        </Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AppShell queryClient={queryClient} />
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
