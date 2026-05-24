import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity, View } from "react-native";

import type { InfoCardProps } from "../profile.types";

export function InfoCard({ title, icon, children, onEdit }: InfoCardProps) {
  return (
    <View className="mb-4 rounded-3xl border border-zinc-100 bg-[#f8fafc] p-5">
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View className="rounded-xl bg-[#002b5b]/10 p-2">
            <Ionicons name={icon} size={20} color="#002b5b" />
          </View>
          <Text className="ml-3 text-base font-bold text-[#002b5b]">{title}</Text>
        </View>
        {onEdit ? (
          <TouchableOpacity onPress={onEdit} className="rounded-lg border border-blue-600 px-3 py-1">
            <Text className="text-xs font-medium text-blue-600">Editar dados</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      {children}
    </View>
  );
}
