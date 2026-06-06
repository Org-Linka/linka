import { TouchableOpacity, View } from "react-native";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

type ProjectCardProps = {
  title: string;
  subtitle: string;
  onPress?: () => void;
};

export default function ProjectCard({
  title,
  subtitle,
  onPress,
}: ProjectCardProps) {
  return (
    <TouchableOpacity
      className="mb-4 rounded-2xl bg-[#F6F7FB] p-4"
      activeOpacity={0.85}
      disabled={!onPress}
      onPress={onPress}
    >
      <View>
        <AccessibleText className="text-base font-atkinson-bold text-[#002B5B] dark:text-blue-100">
          {title}
        </AccessibleText>
        <AccessibleText className="mt-1 text-sm font-atkinson text-[#666]">
          {subtitle}
        </AccessibleText>
      </View>
    </TouchableOpacity>
  );
}
