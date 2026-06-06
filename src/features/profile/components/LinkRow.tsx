import { Ionicons } from "@expo/vector-icons";
import { Linking, TouchableOpacity, View } from "react-native";

import type { LinkRowProps } from "../profile.types";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

export function LinkRow({ label, icon, url, isLast = false }: LinkRowProps) {
  const hasLink = Boolean(url);

  async function handleOpenLink() {
    if (!url) return;

    const normalizedUrl = url.startsWith("http") ? url : `https://${url}`;
    const supported = await Linking.canOpenURL(normalizedUrl);

    if (supported) {
      await Linking.openURL(normalizedUrl);
    }
  }

  return (
    <TouchableOpacity
      onPress={handleOpenLink}
      disabled={!hasLink}
      activeOpacity={0.7}
      className={`flex-row items-center justify-between py-3 ${
        !isLast ? "border-b border-zinc-200 dark:border-zinc-700/50" : ""
      }`}
    >
      <View className="flex-row items-center">
        <Ionicons
          name={icon}
          size={20}
          color={hasLink ? "#002b5b" : "#bdc3c7"}
        />

        <AccessibleText size={14} className="ml-2 text-sm text-zinc-500 dark:text-zinc-400">{label}</AccessibleText>
      </View>

      <View className="flex-row items-center">
        <AccessibleText
          size={14}
          className={`text-sm font-semibold ${
            hasLink ? "text-blue-600" : "text-zinc-400"
          }`}
        >
          {hasLink ? "Acessar perfil" : "Não informado"}
        </AccessibleText>

        {hasLink ? (
          <Ionicons name="open-outline" size={14} color="#2563eb" />
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
