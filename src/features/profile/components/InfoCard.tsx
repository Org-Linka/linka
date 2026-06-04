import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity, View } from "react-native";

import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import type { InfoCardProps } from "../profile.types";

export function InfoCard({ title, icon, children, onEdit }: InfoCardProps) {
  return (
    <View className="mb-4 rounded-3xl border border-zinc-100 bg-[#f8fafc] p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="rounded-xl bg-[#002b5b]/10 p-2">
            <Ionicons name={icon} size={20} color="#002b5b" />
          </View>
          <AccessibleText size={18} className="ml-3 text-base font-bold text-[#002b5b]">{title}</AccessibleText>
        </View>
        {onEdit ? (
          <TouchableOpacity onPress={onEdit} className="rounded-lg border border-blue-600 px-3 py-1">
            <AccessibleText size={14} className="text-xs font-medium text-blue-600">Editar dados</AccessibleText>
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
}
