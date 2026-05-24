import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

import Logo from "@/assets/images/logoLight.png";

export function HomeHeader() {
  return (
    <View className="flex-row items-center justify-between bg-[#002B5B] px-5 py-4">
      <View className="flex-row items-center gap-4">
        <Text className="rounded-xl bg-black/40 p-1">
          <Image source={Logo} style={{ width: 40, height: 40 }} resizeMode="contain" />
        </Text>
        <Text className="text-center text-2xl font-bold text-white font-atkinson-bold">
          Linka
        </Text>
      </View>

      <TouchableOpacity activeOpacity={0.7}>
        <Ionicons name="notifications-outline" size={24} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}
