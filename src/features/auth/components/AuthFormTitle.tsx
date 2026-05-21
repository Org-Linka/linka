import { Text, View } from "react-native";

type AuthFormTitleProps = {
  title: string;
  description: string;
};

export function AuthFormTitle({ title, description }: AuthFormTitleProps) {
  return (
    <View>
      <View className="items-start">
        <Text className="text-4xl font-atkinson-bold text-[#2f3b69]">{title}</Text>
        <View className="mt-1 h-[4px] w-10 rounded-full bg-[#ffde59]" />
      </View>
      <Text className="mt-4 text-lg leading-6 text-zinc-500 font-atkinson">
        {description}
      </Text>
    </View>
  );
}
