import { Ionicons } from "@expo/vector-icons";
import { Image, TouchableOpacity, View } from "react-native";

import type { StudentProfileUser } from "../profile.types";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

type ProfileHeroProps = {
  user: StudentProfileUser;
  onPickImage?: () => void;
};

export function ProfileHero({ user, onPickImage }: ProfileHeroProps) {
  return (
    <View className="items-center bg-[#2F3B69] px-5 pb-20 pt-6">
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPickImage}
        className="relative"
      >
        <View className="h-28 w-28 items-center justify-center overflow-hidden rounded-full border-4 border-white/20 bg-zinc-300">
          {user.avatarUrl ? (
            <Image
              source={{ uri: user.avatarUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <Ionicons name="person" size={50} color="#666" />
          )}
        </View>

        <View className="absolute bottom-0 right-0 rounded-full bg-[#ffde59] p-2 shadow-sm">
          <Ionicons name="camera" size={18} color="#000" />
        </View>
      </TouchableOpacity>

      <AccessibleText size={24} className="mt-4 text-2xl font-bold text-white font-atkinson-bold">
        {user.name}
      </AccessibleText>
      <AccessibleText size={16} className="text-base text-[#bdc3c7] font-atkinson">
        {user.course}
      </AccessibleText>
    </View>
  );
}
