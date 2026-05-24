import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import Logo from "@/assets/images/logoLight.png";

type AppTopBarProps = {
  title: string;
  showBackButton?: boolean;
  rightIcon?: keyof typeof Ionicons.glyphMap;
  onRightPress?: () => void;
};

export function AppTopBar({
  title,
  showBackButton = false,
  rightIcon,
  onRightPress,
}: AppTopBarProps) {
  return (
    <View className="flex-row items-center justify-between bg-[#002B5B] px-5 py-4">
      <View className="flex-row items-center gap-4">
        {showBackButton ? (
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        ) : (
          <View className="rounded-xl bg-black/40 p-1">
            <Image
              source={Logo}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </View>
        )}

        <Text className="text-xl font-bold text-white font-atkinson-bold">
          {title}
        </Text>
      </View>

      {rightIcon ? (
        <TouchableOpacity activeOpacity={0.7} onPress={onRightPress}>
          <Ionicons name={rightIcon} size={24} color="#fff" />
        </TouchableOpacity>
      ) : (
        <View className="h-10 w-10" />
      )}
    </View>
  );
}
