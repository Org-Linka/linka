import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useRef } from "react";
import { Animated, Image, Text, TouchableOpacity, View } from "react-native";

import type { Member } from "../about.types";

type MemberCardProps = {
  member: Member;
  onPress: (member: Member) => void;
};

export function MemberCard({ member, onPress }: MemberCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, friction: 8, tension: 120 }).start();
  }

  function handlePressOut() {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 8, tension: 120 }).start();
  }

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() => onPress(member)}
        className="flex-row items-center rounded-[20px] border border-[#2f3b69]/10 bg-white px-4 py-4"
        style={{ boxShadow: "0px 2px 10px rgba(0,0,0,0.08)", gap: 14 }}
      >
        <View className="items-center justify-center rounded-full bg-[#2f3b69]/10" style={{ width: 68, height: 68, padding: 2 }}>
          <View className="overflow-hidden rounded-full bg-zinc-200" style={{ width: 64, height: 64 }}>
            <Image source={member.foto} resizeMode="cover" style={{ width: "100%", height: "100%" }} />
          </View>
        </View>

        <View className="flex-1">
          <Text className="text-[17px] font-atkinson-bold text-[#2f3b69]">{member.nome}</Text>
          <Text className="mt-[2px] text-[13px] text-zinc-400 font-atkinson">{member.descricao}</Text>
        </View>

        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#2f3b69]/6">
          <FontAwesome name="angle-right" size={16} color="#2f3b69" />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}
