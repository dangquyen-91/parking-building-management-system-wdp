import { Redirect } from "expo-router";

import { useCurrentUserQuery } from "@/hooks/useAuth";
import { getHomeRouteForRole } from "@/lib/role-navigation";

export default function App() {
  const { data: currentUser, isLoading } = useCurrentUserQuery();

  if (isLoading) {
    return null;
  }

  return <Redirect href={getHomeRouteForRole(currentUser?.role)} />;
}
