import { useContext } from "react";

import { AccessibilityContext } from "./accessibility.context";

export default function useAccessibilitySettings() {
    const context = useContext(AccessibilityContext);

    if (!context) {
        throw new Error(
            "useAccessibilitySettings deve ser usado dentro de AccessibilityProvider"
        );
    }

    return context;
}