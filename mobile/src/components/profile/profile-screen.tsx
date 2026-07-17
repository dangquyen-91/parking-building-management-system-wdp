import { useRouter } from "expo-router";
import { Alert } from "react-native";
import { useState } from "react";
import { toast } from "sonner-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { GlassCard, Page } from "@/components/parking-ui";
import {
  ProfileAuthRequiredCard,
  ProfileHeaderCard,
  ProfileLoadingCard,
  ProfileSubscriptionCard,
  ProfileVehiclesCard,
} from "@/components/profile";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  useAddVehicleMutation,
  useCurrentUserQuery,
  useLogoutMutation,
  useRemoveVehicleMutation,
} from "@/hooks/useAuth";
import type { UserVehicle } from "@/types/auth";
import { formatDate, formatRole } from "@/utils/format";
import { Pressable, ScrollView, Text, View, useThemeColors } from "@/tw";

type ProfileScreenProps = {
  showSubscriptionCard?: boolean;
  showVehiclesCard?: boolean;
  subtitle?: string;
  titleFallback?: string;
};

export function ProfileScreen({
  showSubscriptionCard = true,
  showVehiclesCard = true,
  subtitle = "Thông tin tài khoản gửi xe của bạn trong hệ thống quản lý tòa nhà.",
  titleFallback = "Hồ sơ",
}: ProfileScreenProps) {
  const router = useRouter();
  const { iconPrimary } = useThemeColors();
  const {
    data: currentUser,
    error,
    isLoading,
  } = useCurrentUserQuery();
  const logoutMutation = useLogoutMutation();
  const addVehicleMutation = useAddVehicleMutation();
  const removeVehicleMutation = useRemoveVehicleMutation();

  const [isAddingVehicle, setIsAddingVehicle] = useState(false);
  const [licensePlate, setLicensePlate] = useState("");
  const [removingVehicleId, setRemovingVehicleId] = useState<string | null>(null);
  const [vehicleType, setVehicleType] = useState<"car" | "motorcycle">("car");

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      toast.success("Đăng xuất thành công", {
        description: "Phiên đăng nhập của bạn đã được xóa.",
      });
    } catch {
      toast.info("Đăng xuất thất bại", {
        description: "Đã xảy ra lỗi khi đăng xuất.",
      });
    }
  };

  const handleOpenMySubscription = () => {
    router.push("/subscription/history");
  };

  const handleOpenProfileDetails = () => {
    if (!currentUser?._id) {
      return;
    }

    router.push({
      pathname: "/profile/[profileId]",
      params: { profileId: currentUser._id },
    });
  };

  const handleAddVehicle = async () => {
    const normalizedPlate = licensePlate.trim().toUpperCase();

    if (normalizedPlate.length < 4) {
      toast.info("Biển số không hợp lệ", {
        description: "Vui lòng nhập biển số từ 4 ký tự trở lên.",
      });
      return;
    }

    try {
      await addVehicleMutation.mutateAsync({
        licensePlate: normalizedPlate,
        vehicleType,
      });

      setLicensePlate("");
      setVehicleType("car");
      setIsAddingVehicle(false);
      toast.success("Thêm phương tiện thành công");
    } catch (mutationError) {
      toast.info("Thêm phương tiện thất bại", {
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Không thể thêm phương tiện lúc này.",
      });
    }
  };

  const handleRemoveVehicle = (vehicle: UserVehicle) => {
    if (!vehicle._id) {
      toast.info("Không thể xóa phương tiện", {
        description: "Phương tiện này không có định danh hợp lệ.",
      });
      return;
    }

    const vehicleId = vehicle._id;

    Alert.alert(
      "Xóa phương tiện",
      `Bạn có chắc muốn xóa biển số ${vehicle.licensePlate}?`,
      [
        {
          style: "cancel",
          text: "Hủy",
        },
        {
          style: "destructive",
          text: "Xóa",
          onPress: async () => {
            try {
              setRemovingVehicleId(vehicleId);
              await removeVehicleMutation.mutateAsync(vehicleId);
              toast.success("Xóa phương tiện thành công");
            } catch (mutationError) {
              toast.info("Xóa phương tiện thất bại", {
                description:
                  mutationError instanceof Error
                    ? mutationError.message
                    : "Không thể xóa phương tiện lúc này.",
              });
            } finally {
              setRemovingVehicleId(null);
            }
          },
        },
      ],
    );
  };

  return (
    <Page
      eyebrow="Tài khoản"
      title={currentUser?.fullName ?? titleFallback}
      subtitle={subtitle}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-5 pb-[120px]"
      >
        {isLoading ? (
          <ProfileLoadingCard iconColor={iconPrimary} />
        ) : currentUser ? (
          <>
            <ProfileHeaderCard
              email={currentUser.email}
              fullName={currentUser.fullName}
            />

            <Pressable onPress={handleOpenProfileDetails}>
              <GlassCard className="gap-4">
                <View className="flex-row items-center justify-between">
                  <View className="gap-1">
                    <Text className="font-sans text-base font-extrabold text-fg">
                      Thông tin cá nhân
                    </Text>
                    <Text className="font-sans text-sm leading-5 text-subtle">
                      Xem và chỉnh sửa thông tin cá nhân của bạn
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" color={iconPrimary} size={20} />
                </View>

                <View className="gap-3">
                  <View className="gap-1">
                    <Text className="font-sans text-xs font-bold uppercase text-faint">
                      Email
                    </Text>
                    <Text className="font-sans text-base font-bold text-fg">
                      {currentUser.email}
                    </Text>
                  </View>
                  <View className="gap-1">
                    <Text className="font-sans text-xs font-bold uppercase text-faint">
                      Số điện thoại
                    </Text>
                    <Text className="font-sans text-base font-bold text-fg">
                      {currentUser.phone || "Chưa cập nhật"}
                    </Text>
                  </View>
                  <View className="gap-1">
                    <Text className="font-sans text-xs font-bold uppercase text-faint">
                      Vai trò
                    </Text>
                    <Text className="font-sans text-base font-bold text-fg">
                      {formatRole(currentUser.role)}
                    </Text>
                  </View>
                  <View className="gap-1">
                    <Text className="font-sans text-xs font-bold uppercase text-faint">
                      Ngày sinh
                    </Text>
                    <Text className="font-sans text-base font-bold text-fg">
                      {currentUser.dateOfBirth
                        ? formatDate(currentUser.dateOfBirth)
                        : "Chưa cập nhật"}
                    </Text>
                  </View>
                </View>
              </GlassCard>
            </Pressable>

            {showVehiclesCard ? (
              <ProfileVehiclesCard
                isAdding={isAddingVehicle}
                isRemovingVehicle={removeVehicleMutation.isPending}
                isSubmitting={addVehicleMutation.isPending}
                licensePlate={licensePlate}
                onLicensePlateChange={setLicensePlate}
                onRemoveVehicle={handleRemoveVehicle}
                onSave={handleAddVehicle}
                onToggle={() => setIsAddingVehicle((value) => !value)}
                onVehicleTypeChange={setVehicleType}
                placeholderColor=""
                removingVehicleId={removingVehicleId}
                vehicleType={vehicleType}
                vehicles={currentUser.vehicles}
              />
            ) : null}

            {showSubscriptionCard ? (
              <ProfileSubscriptionCard
                iconColor={iconPrimary}
                onPress={handleOpenMySubscription}
              />
            ) : null}

            <ThemeToggle />

            <View className="gap-3">
              <Pressable
                className="items-center rounded-full bg-btn-primary py-4"
                disabled={logoutMutation.isPending}
                onPress={handleLogout}
              >
                <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
                  {logoutMutation.isPending ? "Đang đăng xuất..." : "Đăng xuất"}
                </Text>
              </Pressable>
            </View>
          </>
        ) : (
          <ProfileAuthRequiredCard iconColor={iconPrimary} />
        )}

        {error ? (
          <GlassCard className="gap-2 border border-border-strong">
            <Text className="font-sans text-sm leading-5 text-subtle">
              {error instanceof Error ? error.message : "Không thể tải hồ sơ."}
            </Text>
          </GlassCard>
        ) : null}
      </ScrollView>
    </Page>
  );
}
