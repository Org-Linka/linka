import useAccessibilitySettings from "../useAccessibilitySettings";

export function useTheme() {
    const { theme, isDarkMode, setTheme } = useAccessibilitySettings();

    return {
        theme,
        isDarkMode,
        setTheme,
    };
}