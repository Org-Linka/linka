import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import type { InfoCardProps } from "../profile.types";
import useAccessibilitySettings from "@/features/accessibility/useAccessibilitySettings";

export function InfoCard({ title, icon, children, onEdit }: InfoCardProps) {
  const { isDarkMode } = useAccessibilitySettings();

  const iconColor = isDarkMode ? "#BFDBFE" : "#002B5B";

  return (
    <View className="mb-4 rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-[#f8fafc] p-5 dark:bg-zinc-900">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="rounded-xl bg-[#002b5b]/10 p-2">
            <Ionicons name={icon} size={20} color={iconColor} />
          </View>
          <AccessibleText size={18} className="ml-3 text-base font-bold text-[#002b5b] dark:text-white">{title}</AccessibleText>
        </View>
        {onEdit ? (
          <TouchableOpacity onPress={onEdit} className="rounded-lg border border-blue-600 px-3 py-1 dark:border-blue-100">
            <AccessibleText size={14} className="text-xs font-medium text-blue-600 dark:text-blue-100">Editar dados</AccessibleText>
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
}
