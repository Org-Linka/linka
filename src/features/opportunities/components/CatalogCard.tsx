import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

import type { CatalogItem } from "../opportunities.types";

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
      className="mb-4 overflow-hidden rounded-3xl border border-zinc-100 bg-white"
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
              color="#002B5B"
            />
          </View>
        )}

        <View className="absolute left-3 top-3 rounded-full bg-[#002B5B] px-3 py-1">
          <Text className="text-xs font-bold text-white">
            {item.type === "course" ? "Curso" : "Evento"}
          </Text>
        </View>
      </View>

      <View className="gap-2 p-4">
        <View className="flex-row items-start justify-between gap-3">
          <View className="flex-1">
            <Text className="text-lg font-bold text-[#002B5B]" numberOfLines={2}>
              {item.title}
            </Text>
            <Text className="mt-1 text-sm text-zinc-500" numberOfLines={1}>
              {item.companyName}
            </Text>
          </View>

          <View className="rounded-full bg-[#FFF7CC] px-3 py-1">
            <Text className="text-xs font-bold text-[#6B5800]">
              {item.priceLabel}
            </Text>
          </View>
        </View>

        {item.description ? (
          <Text className="text-sm leading-5 text-zinc-600" numberOfLines={2}>
            {item.description}
          </Text>
        ) : null}

        {metadata.length > 0 ? (
          <View className="mt-1 flex-row flex-wrap gap-2">
            {metadata.map((label) => (
              <View key={label} className="rounded-full bg-zinc-100 px-3 py-1">
                <Text className="text-xs font-semibold text-zinc-700">{label}</Text>
              </View>
            ))}
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}
