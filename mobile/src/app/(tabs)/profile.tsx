import Ionicons from "react-native-vector-icons/Ionicons";
import { toast } from "sonner-native";

import { GlassCard, Label, Page } from "../../components/parking-ui";
import { useCurrentUserQuery, useLogoutMutation } from "../../hooks/useAuth";
import { formatRole } from "@/utils/format";
import { Link, Pressable, ScrollView, Text, View } from "../../tw";

const getInitials = (name?: string) => {
  if (!name?.trim()) {
    return "U";
  }

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
};

export default function Profile() {
  const {
    data: currentUser,
    error,
    isFetching,
    isLoading,
    refetch,
  } = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();

  const profileItems = currentUser
    ? [
        ["Full name", currentUser.fullName],
        ["Email", currentUser.email],
        ["Phone", currentUser.phone || "Not updated"],
        ["Role", formatRole(currentUser.role)],
        ["Status", currentUser.isActive ? "Active" : "Inactive"],
      ]
    : [];

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Logged out", {
        description: "Your session has been cleared.",
      });
    } catch {
      toast.info("Logged out", {
        description: "Your local session has been cleared.",
      });
    }
  };

  const handleRefresh = async () => {
    const result = await refetch();

    if (result.isSuccess) {
      toast.success("Profile refreshed");
    }
  };

  return (
    <Page
      eyebrow="Account"
      title={currentUser?.fullName ?? "Profile"}
      subtitle="Your parking account details from the building management system."
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-5 pb-[120px]"
      >
        {isLoading ? (
          <GlassCard className="items-center gap-3">
            <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-badge">
              <Ionicons name="person" color="#ffffff" size={30} />
            </View>
            <Text className="font-sans text-base font-extrabold text-fg">
              Loading profile...
            </Text>
          </GlassCard>
        ) : currentUser ? (
          <>
            <GlassCard className="items-center gap-3">
              <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-btn-primary">
                <Text className="font-sans text-2xl font-black text-btn-primary-fg">
                  {getInitials(currentUser.fullName)}
                </Text>
              </View>
              <View className="items-center gap-1">
                <Text className="font-sans text-xl font-extrabold text-fg">
                  {currentUser.fullName}
                </Text>
                <Text selectable className="font-sans text-sm text-subtle">
                  {currentUser.email}
                </Text>
              </View>
            </GlassCard>

            <GlassCard className="gap-3.5">
              {profileItems.map(([label, value], index) => (
                <View
                  key={label}
                  className={`gap-1 pb-3.5 ${
                    index === profileItems.length - 1
                      ? "border-b-0 pb-0"
                      : "border-b border-border-theme"
                  }`}
                >
                  <Label>{label}</Label>
                  <Text selectable className="font-sans text-base font-bold text-fg">
                    {value}
                  </Text>
                </View>
              ))}
            </GlassCard>

            <View className="gap-3">
              <Pressable
                className="items-center rounded-full bg-btn-primary py-4"
                disabled={logoutMutation.isPending}
                onPress={handleLogout}
              >
                <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                  {logoutMutation.isPending ? "Signing out..." : "Sign out"}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <GlassCard className="gap-4">
            <View className="h-12 w-12 items-center justify-center rounded-full bg-badge">
              <Ionicons name="lock-closed" color="#ffffff" size={22} />
            </View>
            <View className="gap-1">
              <Text className="font-sans text-xl font-extrabold text-fg">
                Sign in required
              </Text>
              <Text className="font-sans text-sm leading-5 text-subtle">
                Sign in to view your account profile.
              </Text>
            </View>
            <Link href="/(auth)/login" asChild>
              <Pressable className="items-center rounded-full bg-btn-primary py-4">
                <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                  Sign in
                </Text>
              </Pressable>
            </Link>
          </GlassCard>
        )}

        {error ? (
          <GlassCard className="gap-2 border border-border-strong">
            <Label>Sync issue</Label>
            <Text className="font-sans text-sm leading-5 text-subtle">
              {error instanceof Error ? error.message : "Cannot load profile."}
            </Text>
          </GlassCard>
        ) : null}
      </ScrollView>
    </Page>
  );
}
