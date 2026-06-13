import { Ionicons } from "@expo/vector-icons";
import { TouchableOpacity } from "react-native";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import type { HomeCategory } from "../home.types";

type CategoryPillProps = {
  category: HomeCategory;
  onPress: (category: HomeCategory) => void;
};

export function CategoryPill({ category, onPress }: CategoryPillProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.82}
      className="mb-6 mr-3 h-11 flex-row items-center rounded-full border border-zinc-800 bg-[#2a2a2a] px-3"
      onPress={() => onPress(category)}
    >
      <Ionicons name={category.icone} size={19} color="#fff" />
      <AccessibleText className="ml-2 max-w-[92px] font-medium text-zinc-200" numberOfLines={1}>
        {category.nome}
      </AccessibleText>
    </TouchableOpacity>
  );
}
