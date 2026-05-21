import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Linking, Text, TouchableOpacity, View } from "react-native";

import type { FontAwesomeName } from "../about.types";

type SocialButtonProps = {
  icon: FontAwesomeName;
  label: string;
  url: string;
};

export function SocialButton({ icon, label, url }: SocialButtonProps) {
  async function handleOpenLink() {
    if (!url) return;
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={handleOpenLink}
      className="flex-1 rounded-xl border border-[#2f3b69]/15 bg-white px-3 py-3"
      style={{ boxShadow: "0px 2px 8px rgba(0,0,0,0.08)" }}
    >
      <View className="items-center justify-center gap-2">
        <FontAwesome name={icon} size={18} color="#2f3b69" />
        <Text className="text-center text-xs font-atkinson-bold text-[#2f3b69]">
          {label}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
