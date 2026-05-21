import { Text, View } from "react-native";

type SectionTitleProps = {
  title: string;
  subtitle?: string;
  className?: string;
};

export function SectionTitle({ title, subtitle, className = "" }: SectionTitleProps) {
  return (
    <View className={className}>
      <Text className="text-4xl font-atkinson-bold text-[#2f3b69]">
        {title}
      </Text>
      <View className="mt-1 h-[4px] w-10 rounded-full bg-[#ffde59]" />
      {subtitle ? (
        <Text className="mt-3 text-base leading-6 text-zinc-400 font-atkinson">
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}
