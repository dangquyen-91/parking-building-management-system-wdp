import type { ReactNode } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Text, View } from "../tw";

export function Page({
  children,
  eyebrow,
  title,
  subtitle,
}: {
  children: ReactNode;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-page">
      <View className="gap-2 px-5 pb-[18px]" style={{ paddingTop: insets.top + 40 }}>
        {eyebrow ? (
          <Text className="font-sans text-xs font-bold uppercase text-faint">
            {eyebrow}
          </Text>
        ) : null}
        <Text className="font-sans text-[32px] font-extrabold text-fg">
          {title}
        </Text>
        {subtitle ? (
          <Text className="font-sans text-[15px] leading-[22px] text-subtle">
            {subtitle}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View className={`rounded-[18px] border border-border-theme bg-glass-card p-4 ${className}`}>
      {children}
    </View>
  );
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <Text className="font-sans text-xs font-bold uppercase text-faint">
      {children}
    </Text>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <GlassCard className="flex-1 gap-2">
      <Label>{label}</Label>
      <Text selectable className="font-sans text-2xl font-extrabold text-fg">
        {value}
      </Text>
    </GlassCard>
  );
}
