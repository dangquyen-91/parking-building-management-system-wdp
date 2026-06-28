import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Appearance,
  useColorScheme,
} from "react-native";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

type ThemePreference = "system" | "light" | "dark";
type EffectiveColorScheme = "light" | "dark";

type ThemeContextValue = {
  colorScheme: EffectiveColorScheme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
};

const THEME_STORAGE_KEY = "app-theme-preference";

const ThemeContext = createContext<ThemeContextValue | null>(null);

const applyThemePreference = (preference: ThemePreference) => {
  Appearance.setColorScheme(preference === "system" ? "unspecified" : preference);
};

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] =
    useState<ThemePreference>("system");

  const colorScheme: EffectiveColorScheme =
    themePreference === "system"
      ? deviceColorScheme === "dark"
        ? "dark"
        : "light"
      : themePreference;

  useEffect(() => {
    let isMounted = true;

    const loadThemePreference = async () => {
      try {
        const storedPreference = await AsyncStorage.getItem(THEME_STORAGE_KEY);

        if (
          isMounted &&
          (storedPreference === "system" ||
            storedPreference === "light" ||
            storedPreference === "dark")
        ) {
          setThemePreferenceState(storedPreference);
          applyThemePreference(storedPreference);
          return;
        }
      } catch {
        // Fall back to system appearance if storage is unavailable.
      }

      if (isMounted) {
        applyThemePreference("system");
      }
    };

    void loadThemePreference();

    return () => {
      isMounted = false;
    };
  }, []);

  const setThemePreference = (preference: ThemePreference) => {
    setThemePreferenceState(preference);
    applyThemePreference(preference);
    void AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
  };

  const value = useMemo(
    () => ({
      colorScheme,
      themePreference,
      setThemePreference,
      toggleTheme: () =>
        setThemePreference(colorScheme === "dark" ? "light" : "dark"),
    }),
    [colorScheme, themePreference],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useAppTheme must be used within ThemeProvider");
  }

  return context;
}
