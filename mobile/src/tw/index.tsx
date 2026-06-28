import { Link as RouterLink } from "expo-router";
import {
  useCssElement,
  useNativeVariable as useFunctionalVariable,
} from "react-native-css";
import {
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  Text as RNText,
  TextInput as RNTextInput,
  View as RNView,
} from "react-native";

const css = useCssElement as (
  component: React.ElementType,
  props: object,
  mapping: Record<string, string>,
) => React.ReactElement;

export const useCSSVariable =
  process.env.EXPO_OS !== "web"
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`;

export const useThemeColors = () => ({
  fg: useCSSVariable("--color-fg"),
  btnPrimaryFg: useCSSVariable("--color-btn-primary-fg"),
  placeholder: useCSSVariable("--color-placeholder"),
  iconPrimary: useCSSVariable("--color-icon-primary"),
  iconMuted: useCSSVariable("--color-icon-muted"),
  tabBar: useCSSVariable("--color-tab-bar"),
  tabInactive: useCSSVariable("--color-tab-inactive"),
  borderStrong: useCSSVariable("--color-border-strong"),
});

type LinkComponent = ((
  props: React.ComponentProps<typeof RouterLink> & { className?: string },
) => React.ReactElement) &
  Pick<typeof RouterLink, "Trigger" | "Menu" | "MenuAction" | "Preview">;

export const Link = ((props) =>
  css(RouterLink, props, { className: "style" })) as LinkComponent;

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

export const View = (
  props: React.ComponentProps<typeof RNView> & { className?: string },
) => css(RNView, props, { className: "style" });

export const Text = (
  props: React.ComponentProps<typeof RNText> & { className?: string },
) => css(RNText, props, { className: "style" });

export const ScrollView = (
  props: React.ComponentProps<typeof RNScrollView> & {
    className?: string;
    contentContainerClassName?: string;
  },
) =>
  css(RNScrollView, props, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  });

export const Pressable = (
  props: React.ComponentProps<typeof RNPressable> & { className?: string },
) => css(RNPressable, props, { className: "style" });

export const TextInput = (
  props: React.ComponentProps<typeof RNTextInput> & { className?: string },
) => css(RNTextInput, props, { className: "style" });
