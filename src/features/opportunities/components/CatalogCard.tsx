import { Ionicons } from "@expo/vector-icons";
import { Image, TouchableOpacity, View } from "react-native";

import type { CatalogItem } from "../opportunities.types";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

type CatalogCardProps = {
  item: CatalogItem;
  onPress: (item: CatalogItem) => void;
};

export function CatalogCard({ item, onPress }: CatalogCardProps) {
  const metadata = [
    item.modality,
    item.type === "course" ? item.workloadLabel : item.dateLabel,
    item.level,
  ].filter(Boolean);

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      className="mb-4 overflow-hidden rounded-3xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900"
      onPress={() => onPress(item)}
      style={{
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      }}
    >
      <View className="h-36 bg-[#E8EEF6]">
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <View className="h-full w-full items-center justify-center bg-[#E8EEF6]">
            <Ionicons
              name={item.type === "course" ? "school-outline" : "calendar-outline"}
              size={42}
              color="#2F3B69"
            />
          </View>
        )}

        <View className="absolute left-3 top-3 rounded-full bg-[#2F3B69] px-3 py-1">
          <AccessibleText className="text-xs font-bold text-white">
            {item.type === "course" ? "Curso" : "Evento"}
          </AccessibleText>
        </View>
      </View>

      <View className="gap-2 p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <AccessibleText className="text-lg font-bold text-[#2F3B69] dark:text-blue-100" numberOfLines={2}>
              {item.title}
            </AccessibleText>
            <AccessibleText className="mt-1 text-sm text-zinc-500 dark:text-zinc-400" numberOfLines={1}>
              {item.companyName}
            </AccessibleText>
          </View>

          <View className="rounded-full bg-[#FFF7CC] px-3 py-1">
            <AccessibleText className="text-xs font-bold text-[#6B5800]">
              {item.priceLabel}
            </AccessibleText>
          </View>
        </View>

        {item.description ? (
          <AccessibleText className="text-sm leading-5 text-zinc-600 dark:text-zinc-300" numberOfLines={2}>
            {item.description}
          </AccessibleText>
        ) : null}

        {metadata.length > 0 ? (
          <View className="mt-1 flex-row flex-wrap gap-2">
            {metadata.map((label) => (
              <View key={label} className="rounded-full bg-zinc-100 dark:bg-zinc-800 px-3 py-1">
                <AccessibleText className="text-xs font-semibold text-zinc-700 dark:text-zinc-200">{label}</AccessibleText>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
