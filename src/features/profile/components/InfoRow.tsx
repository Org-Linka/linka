import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import type { InfoRowProps } from "../profile.types";

export function InfoRow({
  label,
  value,
  isLast = false,
  isAction = false,
  statusColor = "",
}: InfoRowProps) {
  return (
    <View
      className={`flex-row justify-between py-3 ${!isLast ? "border-b border-zinc-200/50" : ""}`}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <Text className="text-sm text-zinc-500">{label}</Text>
      <View className="ml-4 flex-1 flex-row items-center justify-end">
        <Text numberOfLines={1} className={`text-right text-sm font-semibold text-zinc-800 ${statusColor}`}>
          {value}
        </Text>
        {isAction ? <Ionicons name="chevron-forward" size={16} color="#bdc3c7" className="ml-1" /> : null}
      </View>
    </View>
  );
}
