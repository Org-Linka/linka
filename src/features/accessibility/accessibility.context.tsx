import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme } from "nativewind";
import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type PropsWithChildren,
} from "react";
import { Appearance } from "react-native";

import type {
    AccessibilityContextValue,
    AppFontSizePreference,
    AppThemePreference,
} from "./accessibility.types";

const ACCESSIBILITY_STORAGE_KEY =  "@linka:accessibility-settings";

const DEFAULT_THEME: AppThemePreference = "system";
const DEFAULT_FONT_SIZE: AppFontSizePreference = "default";

const FONT_SCALE_BY_PREFERENCE: Record<AppFontSizePreference, number> = {
  default: 1,
  large: 1.12,
  extraLarge: 1.25,
};

export const AccessibilityContext =
  createContext<AccessibilityContextValue | null>(null);

function getSystemTheme() {
  return Appearance.getColorScheme() === "dark" ? "dark" : "light";
}

async function persistSettings(settings: {
  theme: AppThemePreference;
  fontSize: AppFontSizePreference;
}) {
  await AsyncStorage.setItem(
    ACCESSIBILITY_STORAGE_KEY,
    JSON.stringify(settings),
  );
}

export function AccessibilityProvider({ children }: PropsWithChildren) {
  const [theme, setThemeState] = useState<AppThemePreference>(DEFAULT_THEME);
  const [fontSize, setFontSizeState] =
    useState<AppFontSizePreference>(DEFAULT_FONT_SIZE);
  const [systemTheme, setSystemTheme] = useState<"light" | "dark">(
    getSystemTheme(),
  );

  const resolvedTheme = theme === "system" ? systemTheme : theme;
  const isDarkMode = resolvedTheme === "dark";
  const fontScale = FONT_SCALE_BY_PREFERENCE[fontSize];

  useEffect(() => {
    async function loadSettings() {
      try {
        const storedSettings = await AsyncStorage.getItem(
          ACCESSIBILITY_STORAGE_KEY,
        );

        if (!storedSettings) {
          return;
        }

        const parsedSettings = JSON.parse(storedSettings) as Partial<{
          theme: AppThemePreference;
          fontSize: AppFontSizePreference;
        }>;

        if (
          parsedSettings.theme === "system" ||
          parsedSettings.theme === "light" ||
          parsedSettings.theme === "dark"
        ) {
          setThemeState(parsedSettings.theme);
        }

        if (
          parsedSettings.fontSize === "default" ||
          parsedSettings.fontSize === "large" ||
          parsedSettings.fontSize === "extraLarge"
        ) {
          setFontSizeState(parsedSettings.fontSize);
        }
      } catch (error) {
        console.error("Erro ao carregar preferências de acessibilidade:", error);
      }
    }

    void loadSettings();
  }, []);

  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme: scheme }) => {
      setSystemTheme(scheme === "dark" ? "dark" : "light");
    });

    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const nextTheme = theme === "system" ? systemTheme : theme;

    colorScheme.set(nextTheme);
  }, [theme, systemTheme]);

  const setTheme = useCallback(
    async (nextTheme: AppThemePreference) => {
      setThemeState(nextTheme);

      await persistSettings({
        theme: nextTheme,
        fontSize,
      });
    },
    [fontSize],
  );

  const setFontSize = useCallback(
    async (nextFontSize: AppFontSizePreference) => {
      setFontSizeState(nextFontSize);

      await persistSettings({
        theme,
        fontSize: nextFontSize,
      });
    },
    [theme],
  );

  const value = useMemo<AccessibilityContextValue>(
    () => ({
      theme,
      fontSize,
      isDarkMode,
      fontScale,
      setTheme,
      setFontSize,
    }),
    [fontScale, fontSize, isDarkMode, setFontSize, setTheme, theme],
  );

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}