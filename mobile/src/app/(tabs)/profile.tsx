import { GlassCard, Label, Page } from "../../components/parking-ui";
import { ScrollView, Text, View } from "../../tw";

const items = [
  ["Monthly pass", "Active until 30 Jun 2026"],
  ["Default vehicle", "59A 248.72"],
  ["Payment method", "Visa **** 4028"],
];

export default function Profile() {
  return (
    <Page
      eyebrow="Account"
      title="Lam Hoang"
      subtitle="Building tenant profile, linked vehicle, and parking access credentials."
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-5 pb-[120px]"
      >
        <GlassCard className="items-center gap-3">
          <View className="h-[72px] w-[72px] items-center justify-center rounded-full bg-btn-primary">
            <Text className="font-sans text-2xl font-black text-btn-primary-fg">
              MN
            </Text>
          </View>
          <View className="items-center gap-1">
            <Text className="font-sans text-xl font-extrabold text-fg">
              Resident parking
            </Text>
            <Text selectable className="font-sans text-sm text-subtle">
              Card ID: PKG-2026-0148
            </Text>
          </View>
        </GlassCard>

        <GlassCard className="gap-3.5">
          {items.map(([label, value]) => (
            <View
              key={label}
              className={`gap-1 pb-3.5 ${
                label === "Payment method"
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
      </ScrollView>
    </Page>
  );
}
