import { GlassCard } from "@/components/parking-ui";
import { Text, View } from "@/tw";

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

type ProfileHeaderCardProps = {
  email: string;
  fullName: string;
};

export function ProfileHeaderCard({ email, fullName }: ProfileHeaderCardProps) {
  return (
    <GlassCard className="items-center gap-3">
      <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-btn-primary">
        <Text className="font-sans text-2xl font-black text-btn-primary-fg">
          {getInitials(fullName)}
        </Text>
      </View>
      <View className="items-center gap-1">
        <Text className="font-sans text-xl font-extrabold text-fg">{fullName}</Text>
        <Text selectable className="font-sans text-sm text-subtle">
          {email}
        </Text>
      </View>
    </GlassCard>
  );
}
