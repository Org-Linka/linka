import { View } from "react-native";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

type AuthFormTitleProps = {
  title: string;
  description: string;
};

export function AuthFormTitle({ title, description }: AuthFormTitleProps) {
  return (
    <View>
      <View className="items-start">
        <AccessibleText className="text-4xl font-atkinson-bold text-[#002B5B] dark:text-blue-100">{title}</AccessibleText>
        <View className="mt-1 h-[4px] w-10 rounded-full bg-[#ffde59]" />
      </View>
      <AccessibleText className="mt-4 text-lg leading-6 text-zinc-500 dark:text-zinc-400 font-atkinson">
        {description}
      </AccessibleText>
    </View>
  );
}
