import { Text, type TextProps } from "react-native";

import useAccessibilitySettings from "@/features/accessibility/useAccessibilitySettings";

type AccessibleTextProps = TextProps & {
    size?: number;
    children: React.ReactNode;
};

export function AccessibleText({
    size = 16,
    style,
    children,
    ...props
}: AccessibleTextProps) {
    const { fontScale } = useAccessibilitySettings();

    return (
        <Text
            {...props}
            style={[
                {
                    fontSize: size * fontScale,
                },
                style,
            ]}
        >
            {children}
        </Text>
    );
}