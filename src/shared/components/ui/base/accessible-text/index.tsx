import { StyleSheet, Text, type TextProps } from "react-native";

import { useFont } from "@/features/accessibility/hooks";

type AccessibleTextProps = TextProps & {
  size?: number;
  className?: string;
  children: React.ReactNode;
};

const FONT_SIZE_BY_CLASS: Record<string, number> = {
  "text-xs": 12,
  "text-sm": 14,
  "text-base": 16,
  "text-lg": 18,
  "text-xl": 20,
  "text-2xl": 24,
  "text-3xl": 30,
  "text-4xl": 36,
  "text-5xl": 48,
  "text-6xl": 60,
};

function getFontSizeFromClassName(className?: string) {
  if (!className) {
    return undefined;
  }

  const arbitraryFontSize = className.match(/text-\[(\d+)px\]/);

  if (arbitraryFontSize?.[1]) {
    return Number(arbitraryFontSize[1]);
  }

  const classes = className.split(/\s+/);

  for (const classNameItem of classes) {
    const fontSize = FONT_SIZE_BY_CLASS[classNameItem];

    if (fontSize) {
      return fontSize;
    }
  }

  return undefined;
}

export function AccessibleText({
  size,
  className,
  style,
  children,
  ...props
}: AccessibleTextProps) {
  const { fontScale } = useFont();
  const flattenedStyle = StyleSheet.flatten(style);
  const baseFontSize =
    size ??
    (typeof flattenedStyle?.fontSize === "number"
      ? flattenedStyle.fontSize
      : undefined) ??
    getFontSizeFromClassName(className) ??
    16;

  return (
    <Text
      {...props}
      className={className}
      style={[
        style,
        {
          fontSize: baseFontSize * fontScale,
        },
      ]}
    >
      {children}
    </Text>
  );
}
