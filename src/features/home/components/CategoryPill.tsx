import { Ionicons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";

import type { HomeCategory } from "../home.types";

type CategoryPillProps = {
  category: HomeCategory;
};

export function CategoryPill({ category }: CategoryPillProps) {
  return (
    <TouchableOpacity className="mb-6 mr-3 flex-row items-center rounded-full border border-zinc-800 bg-[#2a2a2a] px-4 py-2">
      <Ionicons name={category.icone} size={20} color="#fff" />
      <Text className="ml-2 font-medium text-zinc-200">{category.nome}</Text>
    </TouchableOpacity>
  );
}
