import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";

import type { InfoRowProps } from "../profile.types";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";
import { useTheme } from "@/features/accessibility/hooks";

export function InfoRow({
  label,
  value,
  isLast = false,
  isAction = false,
  statusColor = "",
}: InfoRowProps) {

  const { isDarkMode } = useTheme();

  const iconColor = isDarkMode ? "#BFDBFE" : "#2F3B69";

  return (
    <View
      className={`flex-row justify-between py-3 ${!isLast ? "border-b border-zinc-200 dark:border-zinc-700/50" : ""}`}
      accessible
      accessibilityLabel={`${label}: ${value}`}
    >
      <AccessibleText size={14} className="text-sm text-zinc-500 dark:text-zinc-400">{label}</AccessibleText>
      <View className="ml-4 flex-1 flex-row items-center justify-end">
        <AccessibleText numberOfLines={1} size={14} className={`text-right text-sm font-semibold text-zinc-800 dark:text-white ${statusColor}`}>
          {value}
        </AccessibleText>
        {isAction ? <Ionicons name="chevron-forward" size={16} color={iconColor} className="ml-1" /> : null}
      </View>
    </View>
  );
}
