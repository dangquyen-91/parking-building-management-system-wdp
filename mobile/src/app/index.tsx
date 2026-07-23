import { Redirect } from "expo-router";
import { ActivityIndicator } from "react-native";

import { useCurrentUserQuery } from "@/hooks/useAuth";
import { getHomeRouteForRole } from "@/lib/role-navigation";
import { Text, View } from "@/tw";

export default function App() {
  const { data: currentUser, isLoading } = useCurrentUserQuery();

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

  return <Redirect href={getHomeRouteForRole(currentUser?.role)} />;
}
