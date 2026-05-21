import { Ionicons } from "@expo/vector-icons";
import { Image, Text, TouchableOpacity, View } from "react-native";

import type { ProfileUser } from "../profile.types";

type ProfileHeroProps = {
  user: ProfileUser;
};

export function ProfileHero({ user }: ProfileHeroProps) {
  return (
    <View className="items-center bg-[#002b5b] px-5 pb-20 pt-6">
      <View className="relative">
        <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-zinc-300">
          {user.avatarUrl ? (
            <Image source={{ uri: user.avatarUrl }} className="h-full w-full" />
          ) : (
            <Ionicons name="person" size={50} color="#666" />
          )}
        </View>
        <TouchableOpacity className="absolute bottom-0 right-0 rounded-full bg-[#ffd700] p-2 shadow-sm">
          <Ionicons name="camera" size={18} color="#000" />
        </TouchableOpacity>
      </View>

      <Text className="mt-4 text-2xl font-bold text-white font-atkinson-bold">{user.name}</Text>
      <Text className="text-base text-[#bdc3c7] font-atkinson">{user.course}</Text>
    </View>
  );
}
