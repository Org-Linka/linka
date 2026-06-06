import useAccessibilitySettings from "../useAccessibilitySettings";

export function useFont() {
    const { fontSize, fontScale, setFontSize } = useAccessibilitySettings();

    return {
        fontSize,
        fontScale,
        setFontSize,
    };
}