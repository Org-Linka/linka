export type AppThemePreference = "system" | "light" | "dark";

export type AppFontSizePreference = "default" | "large" | "extraLarge";

export type AccessibilitySettings = {
    theme: AppThemePreference;
    fontSize: AppFontSizePreference;
};

export type AccessibilityContextValue = AccessibilitySettings & {
    isDarkMode: boolean;
    fontScale: number;
    setTheme: (theme: AppThemePreference) => Promise<void>;
    setFontSize: (fontSize: AppFontSizePreference) => Promise<void>;
};