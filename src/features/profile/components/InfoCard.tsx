import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

import { useTheme } from "@/features/accessibility/hooks";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import type { InfoCardProps } from "../profile.types";

export function InfoCard({ title, icon, children, onEdit }: InfoCardProps) {
  const { isDarkMode } = useTheme();

  const iconColor = isDarkMode ? "#BFDBFE" : "#2F3B69";

  return (
    <View className="mb-4 rounded-3xl border border-zinc-100 bg-[#f8fafc] p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <View className="mb-4 flex-row items-start justify-between gap-3">
        <View className="min-w-0 flex-1 flex-row items-center">
          <View className="rounded-xl bg-[#2F3B69]/10 p-2">
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          <AccessibleText
            size={18}
            numberOfLines={2}
            className="ml-3 min-w-0 flex-1 text-base font-bold text-[#2F3B69] dark:text-white font-atkinson-bold"
          >
            {title}
          </AccessibleText>
        </View>

        {onEdit ? (
          <TouchableOpacity
            onPress={onEdit}
            className="shrink-0 rounded-lg border border-blue-600 px-3 py-1 dark:border-blue-100"
          >
            <AccessibleText
              size={14}
              numberOfLines={1}
              className="text-xs font-medium text-blue-600 dark:text-blue-100"
            >
              Editar
            </AccessibleText>
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
}
