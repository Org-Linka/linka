import { View } from "react-native";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import type { HomeHighlight } from "../home.types";

type HighlightCardProps = {
  highlight: HomeHighlight;
  width: number;
};

export function HighlightCard({ highlight, width }: HighlightCardProps) {
  return (
    <View className="mb-6 mr-4 overflow-hidden rounded-2xl bg-[#F1F3F5]" style={{ width }}>
      <View className="h-[130px] bg-[#D1D5DB]" />
      <View className="p-4">
        <AccessibleText className="text-base font-bold text-[#333]">{highlight.titulo}</AccessibleText>
        <AccessibleText className="mt-1 text-xs text-[#666]">
          {highlight.data} - {highlight.local}
        </AccessibleText>
      </View>
    </View>
  );
}
