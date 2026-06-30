import type { UserGender } from "@/types/auth";
import { GlassCard, Label } from "@/components/parking-ui";
import { formatPickerDate } from "@/utils/format";
import { Pressable, Text, TextInput, View, useThemeColors } from "@/tw";

type ProfileDetailItem = {
  label: string;
  value: string;
};

type ProfileDetailValues = {
  address: string;
  cccd: string;
  dateOfBirth?: Date | null;
  email: string;
  fullName: string;
  gender?: UserGender;
  phone: string;
};

type ProfileDetailsCardProps = {
  isEditing: boolean;
  isSaving: boolean;
  items: ProfileDetailItem[];
  onAddressChange: (value: string) => void;
  onCccdChange: (value: string) => void;
  onDateOfBirthPress: () => void;
  onEmailChange: (value: string) => void;
  onFullNameChange: (value: string) => void;
  onGenderChange: (value: UserGender) => void;
  onPhoneChange: (value: string) => void;
  onSave: () => void;
  onToggle: () => void;
  values: ProfileDetailValues;
};

const genderOptions = [
  { label: "Nam", value: "male" as const },
  { label: "Nữ", value: "female" as const },
  { label: "Khác", value: "other" as const },
];

const inputStyle = {
  paddingHorizontal: 16,
  paddingVertical: 14,
};

export function ProfileDetailsCard({
  isEditing,
  isSaving,
  items,
  onAddressChange,
  onCccdChange,
  onDateOfBirthPress,
  onEmailChange,
  onFullNameChange,
  onGenderChange,
  onPhoneChange,
  onSave,
  onToggle,
  values,
}: ProfileDetailsCardProps) {
  const { placeholder } = useThemeColors();

  return (
    <GlassCard className="gap-4">
      <View className="flex-row items-center justify-between">
        <View className="gap-1">
          <Label>Thông tin cá nhân</Label>
          <Text className="font-sans text-base font-extrabold text-fg">
            Xem và chỉnh sửa thông tin cá nhân
          </Text>
        </View>
        <Pressable
          className="rounded-full border border-border-strong bg-badge px-4 py-2.5"
          onPress={onToggle}
        >
          <Text className="font-sans text-sm font-bold text-fg">
            {isEditing ? "Đóng" : "Sửa"}
          </Text>
        </Pressable>
      </View>

      {isEditing ? (
        <View className="gap-3">
          <View className="gap-1">
            <Label>Họ và tên</Label>
            <TextInput
              autoCapitalize="words"
              className="rounded-[16px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
              onChangeText={onFullNameChange}
              placeholder="Họ và tên"
              placeholderTextColor={placeholder}
              style={inputStyle}
              value={values.fullName}
            />
          </View>

          <View className="gap-1">
            <Label>Email</Label>
            <TextInput
              autoCapitalize="none"
              className="rounded-[16px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
              keyboardType="email-address"
              onChangeText={onEmailChange}
              placeholder="Email"
              placeholderTextColor={placeholder}
              style={inputStyle}
              value={values.email}
            />
          </View>

          <View className="gap-1">
            <Label>Số điện thoại</Label>
            <TextInput
              className="rounded-[16px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
              keyboardType="phone-pad"
              onChangeText={onPhoneChange}
              placeholder="Số điện thoại"
              placeholderTextColor={placeholder}
              style={inputStyle}
              value={values.phone}
            />
          </View>

          <View className="gap-1">
            <Label>CCCD</Label>
            <TextInput
              className="rounded-[16px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
              keyboardType="number-pad"
              onChangeText={onCccdChange}
              placeholder="CCCD"
              placeholderTextColor={placeholder}
              style={inputStyle}
              value={values.cccd}
            />
          </View>

          <View className="gap-1">
            <Label>Ngày sinh</Label>
            <Pressable
              className="rounded-[16px] border border-border-theme bg-input px-4 py-3.5"
              onPress={onDateOfBirthPress}
            >
              <Text
                className={`font-sans text-base ${
                  values.dateOfBirth ? "text-fg" : "text-placeholder"
                }`}
              >
                {values.dateOfBirth
                  ? formatPickerDate(values.dateOfBirth)
                  : "Chọn ngày sinh"}
              </Text>
            </Pressable>
          </View>

          <View className="gap-1">
            <Label>Địa chỉ</Label>
            <TextInput
              className="rounded-[16px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
              onChangeText={onAddressChange}
              placeholder="Địa chỉ"
              placeholderTextColor={placeholder}
              style={inputStyle}
              value={values.address}
            />
          </View>

          <View className="gap-2">
            <Label>Giới tính</Label>
            <View className="flex-row gap-2">
              {genderOptions.map((option) => {
                const selected = values.gender === option.value;

                return (
                  <Pressable
                    key={option.value}
                    className={`flex-1 rounded-full border px-4 py-3 ${
                      selected
                        ? "border-border-strong bg-btn-primary"
                        : "border-border-theme bg-input"
                    }`}
                    onPress={() => onGenderChange(option.value)}
                  >
                    <Text
                      className={`text-center font-sans text-sm font-bold ${
                        selected ? "text-btn-primary-fg" : "text-fg"
                      }`}
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <Pressable
            className="items-center rounded-full bg-btn-primary py-4"
            disabled={isSaving}
            onPress={onSave}
          >
            <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
              {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
            </Text>
          </Pressable>
        </View>
      ) : (
        <View className="gap-3.5">
          {items.map((item, index) => (
            <View
              key={item.label}
              className={`gap-1 pb-3.5 ${
                index === items.length - 1
                  ? "border-b-0 pb-0"
                  : "border-b border-border-theme"
              }`}
            >
              <Label>{item.label}</Label>
              <Text selectable className="font-sans text-base font-bold text-fg">
                {item.value}
              </Text>
            </View>
          ))}
        </View>
      )}
    </GlassCard>
  );
}
