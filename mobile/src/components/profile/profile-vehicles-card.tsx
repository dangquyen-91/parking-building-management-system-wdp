import { GlassCard, Label } from "@/components/parking-ui";
import type { UserVehicle } from "@/types/auth";
import { formatVehicleType } from "@/utils/format";
import { Pressable, Text, TextInput, View, useThemeColors } from "@/tw";

type ProfileVehiclesCardProps = {
  isAdding: boolean;
  isSubmitting: boolean;
  licensePlate: string;
  onLicensePlateChange: (value: string) => void;
  onSave: () => void;
  onToggle: () => void;
  onVehicleTypeChange: (value: "car" | "motorcycle") => void;
  placeholderColor: string;
  vehicleType: "car" | "motorcycle";
  vehicles?: UserVehicle[];
};

const vehicleOptions = [
  { label: "Ô tô", value: "car" as const },
  { label: "Xe máy", value: "motorcycle" as const },
];

const inputStyle = {
  paddingHorizontal: 16,
  paddingVertical: 14,
};

export function ProfileVehiclesCard({
  isAdding,
  isSubmitting,
  licensePlate,
  onLicensePlateChange,
  onSave,
  onToggle,
  onVehicleTypeChange,
  placeholderColor,
  vehicleType,
  vehicles,
}: ProfileVehiclesCardProps) {
  const { placeholder } = useThemeColors();

  return (
    <GlassCard className="gap-4">
      <View className="flex-row items-center justify-between">
        <View className="gap-1">
          <Label>Phương tiện</Label>
          <Text className="font-sans text-base font-extrabold text-fg">
            Danh sách xe đã đăng ký
          </Text>
        </View>
        <Pressable
          className="rounded-full border border-border-strong bg-badge px-4 py-2.5"
          onPress={onToggle}
        >
          <Text className="font-sans text-sm font-bold text-fg">
            {isAdding ? "Đóng" : "Thêm xe"}
          </Text>
        </Pressable>
      </View>

      {vehicles?.length ? (
        <View className="gap-3">
          {vehicles.map((vehicle) => (
            <View
              key={vehicle._id ?? vehicle.licensePlate}
              className="rounded-[18px] border border-border-theme bg-badge px-4 py-3.5"
            >
              <Text className="font-sans text-base font-extrabold text-fg">
                {vehicle.licensePlate}
              </Text>
              <Text className="mt-1 font-sans text-sm text-subtle">
                {formatVehicleType(vehicle.vehicleType)}
              </Text>
            </View>
          ))}
        </View>
      ) : (
        <Text className="font-sans text-sm leading-5 text-subtle">
          Bạn chưa đăng ký phương tiện nào.
        </Text>
      )}

      {isAdding ? (
        <View className="gap-3">
          <TextInput
            autoCapitalize="characters"
            className="rounded-[16px] border border-border-theme bg-input px-4 py-3.5 font-sans text-base text-fg"
            onChangeText={onLicensePlateChange}
            placeholder="Biển số xe"
            placeholderTextColor={placeholderColor || placeholder}
            style={inputStyle}
            value={licensePlate}
          />

          <View className="flex-row gap-2">
            {vehicleOptions.map((option) => {
              const selected = vehicleType === option.value;

              return (
                <Pressable
                  key={option.value}
                  className={`flex-1 rounded-full border px-4 py-3 ${
                    selected
                      ? "border-border-strong bg-btn-primary"
                      : "border-border-theme bg-input"
                  }`}
                  onPress={() => onVehicleTypeChange(option.value)}
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

          <Pressable
            className="items-center rounded-full bg-btn-primary py-4"
            disabled={isSubmitting}
            onPress={onSave}
          >
            <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
              {isSubmitting ? "Đang thêm..." : "Lưu phương tiện"}
            </Text>
          </Pressable>
        </View>
      ) : null}
    </GlassCard>
  );
}
