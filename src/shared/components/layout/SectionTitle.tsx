import { View } from "react-native";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function SectionTitle({ title, subtitle, className = "" }: SectionTitleProps) {
  return (
    <View className={className}>
      <AccessibleText className="text-4xl font-atkinson-bold text-[#2f3b69] dark:text-blue-100">
        {title}
      </AccessibleText>
      <View className="mt-1 h-[4px] w-10 rounded-full bg-[#ffde59]" />
      {subtitle ? (
        <AccessibleText className="mt-3 text-base leading-6 text-zinc-400 font-atkinson">
          {subtitle}
        </AccessibleText>
      ) : null}
    </View>
  );
}
