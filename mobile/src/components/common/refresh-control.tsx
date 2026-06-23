import {
  RefreshControl as NativeRefreshControl,
  type RefreshControlProps,
} from "react-native";

const DEFAULT_INDICATOR_COLOR = "#ffffff";
const DEFAULT_TRACK_COLOR = "rgba(255, 255, 255, 0.08)";

export type AppRefreshControlProps = RefreshControlProps;

export function AppRefreshControl({
  colors = [DEFAULT_INDICATOR_COLOR],
  progressBackgroundColor = DEFAULT_TRACK_COLOR,
  tintColor = DEFAULT_INDICATOR_COLOR,
  ...props
}: AppRefreshControlProps) {
  return (
    <NativeRefreshControl
      colors={colors}
      progressBackgroundColor={progressBackgroundColor}
      tintColor={tintColor}
      {...props}
    />
  );
}
