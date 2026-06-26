import { useAppTheme } from "../providers/theme-provider";
import { Pressable, Text, View } from "../tw";

const OPTIONS = [
  { label: "Theo máy", value: "system" },
  { label: "Sáng", value: "light" },
  { label: "Tối", value: "dark" },
] as const;

export function ThemeToggle() {
  const { themePreference, setThemePreference } = useAppTheme();

  return (
    <View className="gap-3 rounded-[18px] border border-border-theme bg-glass-card p-4">
      <Text className="font-sans text-xs font-bold uppercase text-faint">
        Giao diện
      </Text>
      <View className="flex-row rounded-full border border-border-theme bg-badge p-1">
        {OPTIONS.map((option) => {
          const isSelected = themePreference === option.value;

          return (
            <Pressable
              key={option.value}
              className={`flex-1 rounded-full px-3 py-2.5 ${
                isSelected ? "bg-btn-primary" : "bg-transparent"
              }`}
              onPress={() => setThemePreference(option.value)}
            >
              <Text
                className={`text-center font-sans text-sm font-extrabold ${
                  isSelected ? "text-btn-primary-fg" : "text-fg"
                }`}
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <Text className="font-sans text-sm leading-5 text-subtle">
        Chọn giao diện cố định hoặc tự động theo thiết bị của bạn.
      </Text>
    </View>
  );
}
