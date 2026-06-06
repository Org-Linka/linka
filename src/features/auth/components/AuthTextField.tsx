import type { ReactNode } from "react";
import { TextInput, TouchableOpacity, View, type KeyboardTypeOptions, type TextStyle } from "react-native";
import { useFont, useTheme } from "@/features/accessibility/hooks";

const inputResetStyle = {
  outlineStyle: "none",
  boxShadow: "none",
  borderWidth: 0,
} as unknown as TextStyle;

type AuthTextFieldProps = {
  placeholder: string;
  value: string;
  focused: boolean;
  onChangeText: (value: string) => void;
  onFocus: () => void;
  onBlur: () => void;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  autoCapitalize?: "none" | "sentences" | "words" | "characters";
  rightElement?: ReactNode;
  onRightPress?: () => void;
};

export function AuthTextField({
  placeholder,
  value,
  focused,
  onChangeText,
  onFocus,
  onBlur,
  keyboardType,
  secureTextEntry,
  autoCapitalize,
  rightElement,
  onRightPress,
}: AuthTextFieldProps) {
  const { fontScale } = useFont();
  const { isDarkMode } = useTheme();

  return (
    <View
      className={`flex-row items-center rounded-2xl border bg-white dark:bg-zinc-900 px-4 ${
        focused ? "border-[#2f3b69]/40 bg-[#2f3b69]/5 dark:border-blue-400/60 dark:bg-blue-950" : "border-zinc-200 dark:border-zinc-700"
      }`}
    >
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={isDarkMode ? "#a1a1aa" : "#71717a"}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        className="flex-1 bg-transparent py-4 text-zinc-900 dark:text-white"
        style={[inputResetStyle, { fontSize: 16 * fontScale }]}
      />
      {rightElement ? (
        <TouchableOpacity className="ml-3" activeOpacity={0.7} onPress={onRightPress}>
          {rightElement}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
