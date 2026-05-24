import FontAwesome from "@expo/vector-icons/FontAwesome";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";

import logoLogin from "@/assets/images/logoLight.png";

type AboutHeroProps = {
  containerPaddingClassName: string;
  heroHeightClassName: string;
  logoSize: number;
};

export function AboutHero({ containerPaddingClassName, heroHeightClassName, logoSize }: AboutHeroProps) {
  return (
    <View className={`w-full rounded-b-[55px] bg-[#2f3b69] pt-4 pb-7 ${containerPaddingClassName} ${heroHeightClassName}`}>
      <View className="w-full max-w-[420px] self-center">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full bg-white/10"
          >
            <FontAwesome name="angle-left" size={24} color="#ffffff" />
          </TouchableOpacity>

          <View className="flex-row items-center gap-2">
            <Image source={logoLogin} style={{ width: logoSize, height: logoSize }} resizeMode="contain" />
            <Text className="text-3xl font-atkinson-bold text-white">Linka</Text>
          </View>
        </View>

        <View className="mt-7 items-center">
          <Text className="text-center text-4xl font-atkinson-bold text-white">Sobre nós</Text>
          <View className="mt-2 h-[4px] w-12 rounded-full bg-[#ffde59]" />
        </View>
      </View>
    </View>
  );
}
