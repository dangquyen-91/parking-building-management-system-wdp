import type { DateTimePickerChangeEvent } from "@react-native-community/datetimepicker";
import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Platform } from "react-native";
import { toast } from "sonner-native";

import { GlassCard, Page } from "../../components/parking-ui";
import {
  ProfileDatePickerModal,
  ProfileDetailsCard,
  ProfileLoadingCard,
} from "../../components/profile";
import {
  useCurrentUserQuery,
  useUpdateProfileMutation,
} from "../../hooks/useAuth";
import { formatDate, formatRole } from "@/utils/format";
import type { UserGender } from "@/types/auth";
import { ScrollView, Text, useThemeColors } from "../../tw";

const MAX_AGE_YEARS = 100;
const MIN_AGE_YEARS = 16;

const getSingleParam = (value?: string | string[]) =>
  typeof value === "string" ? value : null;

const getGenderLabel = (value?: UserGender) => {
  switch (value) {
    case "male":
      return "Nam";
    case "female":
      return "Nữ";
    case "other":
      return "Khác";
    default:
      return "Chưa cập nhật";
  }
};

const normalizeOptional = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

const formatDateForApi = (value: Date) => value.toISOString().slice(0, 10);

const parseStoredDate = (value?: string) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

const getMinimumBirthDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - MAX_AGE_YEARS);
  return date;
};

const getMaximumBirthDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - MIN_AGE_YEARS);
  return date;
};

export default function ProfileDetailsScreen() {
  const params = useLocalSearchParams<{
    profileId?: string | string[];
  }>();
  const profileId = getSingleParam(params.profileId);
  const { iconPrimary } = useThemeColors();
  const { data: currentUser, error, isLoading } = useCurrentUserQuery();
  const updateProfileMutation = useUpdateProfileMutation();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isBirthDatePickerVisible, setIsBirthDatePickerVisible] = useState(false);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cccd, setCccd] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
  const [address, setAddress] = useState("");
  const [gender, setGender] = useState<UserGender | undefined>(undefined);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    setFullName(currentUser.fullName ?? "");
    setEmail(currentUser.email ?? "");
    setPhone(currentUser.phone ?? "");
    setCccd(currentUser.cccd ?? "");
    setDateOfBirth(parseStoredDate(currentUser.dateOfBirth));
    setAddress(currentUser.address ?? "");
    setGender(currentUser.gender);
  }, [currentUser]);

  const isOwnProfile = useMemo(() => {
    if (!currentUser?._id || !profileId) {
      return false;
    }

    return currentUser._id === profileId;
  }, [currentUser?._id, profileId]);

  const profileItems = currentUser
    ? [
        { label: "Họ và tên", value: currentUser.fullName },
        { label: "Email", value: currentUser.email },
        { label: "Số điện thoại", value: currentUser.phone || "Chưa cập nhật" },
        { label: "CCCD", value: currentUser.cccd || "Chưa cập nhật" },
        {
          label: "Ngày sinh",
          value: currentUser.dateOfBirth ? formatDate(currentUser.dateOfBirth) : "Chưa cập nhật",
        },
        { label: "Giới tính", value: getGenderLabel(currentUser.gender) },
        { label: "Địa chỉ", value: currentUser.address || "Chưa cập nhật" },
        { label: "Vai trò", value: formatRole(currentUser.role) },
        {
          label: "Trạng thái",
          value: currentUser.isActive ? "Đang hoạt động" : "Ngừng hoạt động",
        },
      ]
    : [];

  const handleBirthDateChange = (
    _event: DateTimePickerChangeEvent,
    selectedDate: Date,
  ) => {
    setDateOfBirth(selectedDate);

    if (Platform.OS === "android") {
      setIsBirthDatePickerVisible(false);
    }
  };

  const handleSaveProfile = async () => {
    const normalizedFullName = fullName.trim();

    if (normalizedFullName.length < 2) {
      toast.info("Thông tin chưa hợp lệ", {
        description: "Họ và tên cần ít nhất 2 ký tự.",
      });
      return;
    }

    try {
      await updateProfileMutation.mutateAsync({
        fullName: normalizedFullName,
        email: normalizeOptional(email),
        phone: normalizeOptional(phone),
        cccd: normalizeOptional(cccd),
        dateOfBirth: dateOfBirth ? formatDateForApi(dateOfBirth) : undefined,
        gender,
        address: normalizeOptional(address),
      });

      setIsEditingProfile(false);
      toast.success("Cập nhật hồ sơ thành công");
    } catch (mutationError) {
      toast.info("Cập nhật hồ sơ thất bại", {
        description:
          mutationError instanceof Error
            ? mutationError.message
            : "Không thể cập nhật hồ sơ lúc này.",
      });
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: false,
          headerBackTitle: "Quay lại",
          headerTitle: "Thông tin cá nhân",
        }}
      />

      <Page
        eyebrow="Tài khoản"
        title="Thông tin cá nhân"
        subtitle="Xem và cập nhật đầy đủ thông tin hồ sơ của bạn."
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          contentContainerClassName="gap-4 px-5 pb-[120px]"
        >
          {isLoading ? (
            <ProfileLoadingCard iconColor={iconPrimary} />
          ) : !currentUser ? (
            <GlassCard className="gap-2">
              <Text className="font-sans text-base font-extrabold text-fg">
                Cần đăng nhập
              </Text>
              <Text className="font-sans text-sm text-subtle">
                Đăng nhập để xem và chỉnh sửa thông tin cá nhân.
              </Text>
            </GlassCard>
          ) : !isOwnProfile ? (
            <GlassCard className="gap-2">
              <Text className="font-sans text-base font-extrabold text-fg">
                Hồ sơ không tồn tại
              </Text>
              <Text className="font-sans text-sm text-subtle">
                Hồ sơ này không tồn tại hoặc không thuộc tài khoản của bạn.
              </Text>
            </GlassCard>
          ) : (
            <ProfileDetailsCard
              isEditing={isEditingProfile}
              isSaving={updateProfileMutation.isPending}
              items={profileItems}
              onAddressChange={setAddress}
              onCccdChange={setCccd}
              onDateOfBirthPress={() => setIsBirthDatePickerVisible(true)}
              onEmailChange={setEmail}
              onFullNameChange={setFullName}
              onGenderChange={setGender}
              onPhoneChange={setPhone}
              onSave={handleSaveProfile}
              onToggle={() => setIsEditingProfile((value) => !value)}
              values={{
                address,
                cccd,
                dateOfBirth,
                email,
                fullName,
                gender,
                phone,
              }}
            />
          )}

          {error ? (
            <GlassCard className="gap-2 border border-border-strong">
              <Text className="font-sans text-sm leading-5 text-subtle">
                {error instanceof Error ? error.message : "Không thể tải hồ sơ."}
              </Text>
            </GlassCard>
          ) : null}
        </ScrollView>

        <ProfileDatePickerModal
          maximumDate={getMaximumBirthDate()}
          minimumDate={getMinimumBirthDate()}
          onChange={handleBirthDateChange}
          onDismiss={() => setIsBirthDatePickerVisible(false)}
          value={dateOfBirth ?? getMaximumBirthDate()}
          visible={isBirthDatePickerVisible}
        />
      </Page>
    </>
  );
}
