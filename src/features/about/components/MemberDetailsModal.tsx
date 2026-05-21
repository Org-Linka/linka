import FontAwesome from "@expo/vector-icons/FontAwesome";
import { BlurView } from "expo-blur";
import { Animated, Image, Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import type { Member } from "../about.types";
import { SocialButton } from "./SocialButton";

type MemberDetailsModalProps = {
  member: Member | null;
  fadeAnim: Animated.Value;
  slideAnim: Animated.Value;
  onClose: () => void;
};

export function MemberDetailsModal({ member, fadeAnim, slideAnim, onClose }: MemberDetailsModalProps) {
  return (
    <Modal visible={!!member} animationType="none" transparent onRequestClose={onClose}>
      <View className="flex-1 justify-end">
        <Animated.View style={[StyleSheet.absoluteFill, { opacity: fadeAnim }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
            <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFillObject} />
          </Pressable>
        </Animated.View>

        <Animated.View style={{ transform: [{ translateY: slideAnim }] }}>
          <View className="w-full rounded-t-[32px] border-x border-t border-[#2f3b69]/10 bg-white px-6 pb-10 pt-3" style={{ boxShadow: "0px -4px 24px rgba(0,0,0,0.12)" }}>
            <View className="mb-4 items-center">
              <View className="h-[4px] w-10 rounded-full bg-zinc-200" />
            </View>

            {member ? (
              <>
                <View className="flex-row items-center gap-4">
                  <View className="items-center justify-center rounded-full bg-[#3E829A]" style={{ width: 80, height: 80, padding: 3 }}>
                    <View className="overflow-hidden rounded-full bg-zinc-200" style={{ width: 74, height: 74 }}>
                      <Image source={member.foto} resizeMode="cover" style={{ width: "100%", height: "100%" }} />
                    </View>
                  </View>

                  <View className="flex-1">
                    <Text className="text-[22px] font-atkinson-bold text-[#2f3b69]">{member.nome}</Text>
                    <Text className="mt-1 text-[13px] text-zinc-400 font-atkinson">{member.descricao}</Text>
                  </View>

                  <TouchableOpacity activeOpacity={0.8} onPress={onClose} className="h-9 w-9 items-center justify-center rounded-full bg-zinc-100">
                    <FontAwesome name="close" size={16} color="#2f3b69" />
                  </TouchableOpacity>
                </View>

                <View className="mt-5 h-[1px] bg-zinc-100" />
                <Text className="mt-5 text-[15px] leading-7 text-zinc-600 font-atkinson">
                  {member.descricaoCompleta}
                </Text>

                <View className="mt-6">
                  <Text className="mb-3 text-center text-xs uppercase font-atkinson-bold text-[#2f3b69]" style={{ letterSpacing: 1 }}>
                    Acesse minhas redes
                  </Text>
                  <View className="flex-row gap-3">
                    <SocialButton icon="linkedin" label="LinkedIn" url={member.linkedin} />
                    <SocialButton icon="github" label="GitHub" url={member.github} />
                    <SocialButton icon="globe" label="Portfólio" url={member.portfolio} />
                  </View>
                </View>
              </>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}
