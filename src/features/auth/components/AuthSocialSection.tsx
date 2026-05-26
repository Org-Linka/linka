import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";

type AuthSocialSectionProps = {
  actionLabel: "Entrar" | "Cadastrar";
  onGooglePress: () => void;
  onApplePress: () => void;
};

export function AuthSocialSection({
  actionLabel,
  onGooglePress,
  onApplePress,
}: AuthSocialSectionProps) {
  return (
    <View className="mt-8">
      <View className="flex-row items-center">
        <View className="h-px flex-1 bg-zinc-300" />
        <Text className="mx-3 text-xs text-zinc-300">ou</Text>
        <View className="h-px flex-1 bg-zinc-300" />
      </View>

      <View className="mt-4 gap-3">
        <TouchableOpacity
          className="flex-row items-center justify-center rounded-xl border border-zinc-200 bg-white py-3"
          activeOpacity={0.8}
          onPress={onGooglePress}
        >
          <GoogleOriginalIcon size={18} />
          <Text className="ml-3 text-base font-atkinson-bold text-zinc-700">
            {actionLabel} com Google
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center justify-center rounded-xl bg-zinc-900 py-3"
          activeOpacity={0.8}
          onPress={onApplePress}
        >
          <FontAwesome name="apple" size={20} color="#ffffff" />
          <Text className="ml-3 text-base font-atkinson-bold text-white">
            {actionLabel} com Apple
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

type GoogleOriginalIconProps = {
  size?: number;
};

function GoogleOriginalIcon({ size = 18 }: GoogleOriginalIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <Path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5Z"
      />
      <Path
        fill="#4285F4"
        d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65Z"
      />
      <Path
        fill="#FBBC05"
        d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19Z"
      />
      <Path
        fill="#34A853"
        d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48Z"
      />
    </Svg>
  );
}
