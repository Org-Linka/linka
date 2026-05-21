import type { ReactNode } from "react";
import { TextInput, TouchableOpacity, View, type KeyboardTypeOptions, type TextStyle } from "react-native";

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
  return (
    <View
      className={`flex-row items-center rounded-2xl border bg-white px-4 ${
        focused ? "border-[#2f3b69]/40 bg-[#2f3b69]/5" : "border-zinc-200"
      }`}
    >
      <TextInput
        placeholder={placeholder}
        placeholderTextColor="#71717a"
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        value={value}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        className="flex-1 bg-transparent py-4 text-base text-zinc-900"
        style={inputResetStyle}
      />
      {rightElement ? (
        <TouchableOpacity className="ml-3" activeOpacity={0.7} onPress={onRightPress}>
          {rightElement}
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
