import { GlassCard, Label, Page } from "../../components/parking-ui";
import { Pressable, ScrollView, Text, View } from "../../tw";

const slots = ["A-014", "A-018", "B-032", "V-006"];

export default function Booking() {
  return (
    <Page
      eyebrow="Reservation"
      title="Book a space"
      subtitle="Choose a zone and hold a parking slot for visitors, staff, or monthly tenants."
    >
      <ScrollView
        contentInsetAdjustmentBehavior="automatic"
        contentContainerClassName="gap-4 px-5 pb-[120px]"
      >
        <GlassCard className="gap-4">
          <View className="gap-2">
            <Label>Vehicle</Label>
            <Text selectable className="font-sans text-2xl font-extrabold text-fg">
              59A 248.72
            </Text>
            <Text className="font-sans text-sm text-subtle">
              Resident monthly pass - Sedan
            </Text>
          </View>

          <View className="flex-row gap-2.5">
            <View className="flex-1 gap-1.5">
              <Label>Entry</Label>
              <Text selectable className="font-sans text-[15px] text-muted">
                08:30
              </Text>
            </View>
            <View className="flex-1 gap-1.5">
              <Label>Exit</Label>
              <Text selectable className="font-sans text-[15px] text-muted">
                18:00
              </Text>
            </View>
          </View>
        </GlassCard>

        <View className="gap-2.5">
          <Label>Available slots</Label>
          <View className="flex-row flex-wrap gap-2.5">
            {slots.map((slot, index) => (
              <Pressable
                key={slot}
                className={`min-w-[92px] rounded-[14px] border px-4 py-3.5 ${
                  index === 0
                    ? "border-btn-primary bg-btn-primary"
                    : "border-border-strong bg-badge"
                }`}
              >
                <Text
                  className={`text-center font-sans text-base font-extrabold ${
                    index === 0 ? "text-btn-primary-fg" : "text-fg"
                  }`}
                >
                  {slot}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Pressable className="items-center rounded-full bg-btn-primary py-4">
          <Text className="font-sans text-base font-extrabold text-btn-primary-fg">
            Confirm booking
          </Text>
        </Pressable>
      </ScrollView>
    </Page>
  );
}
