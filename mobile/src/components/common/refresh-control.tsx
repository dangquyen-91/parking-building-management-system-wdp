import {
  RefreshControl as NativeRefreshControl,
  type RefreshControlProps,
} from "react-native";
import { useThemeColors } from "@/tw";

export type AppRefreshControlProps = RefreshControlProps;

export function AppRefreshControl({
  colors,
  progressBackgroundColor,
  tintColor,
  ...props
}: AppRefreshControlProps) {
  const { fg } = useThemeColors();

  return (
    <NativeRefreshControl
      colors={colors ?? [fg]}
      progressBackgroundColor={progressBackgroundColor ?? "rgba(31, 107, 98, 0.12)"}
      tintColor={tintColor ?? fg}
      {...props}
    />
  );
}
