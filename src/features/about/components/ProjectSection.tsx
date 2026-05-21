import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image, Text, View } from "react-native";

import logoLogin from "@/assets/images/logoLight.png";

import { projectFeatures } from "../about.data";

export function ProjectSection() {
  return (
    <View className="mt-7 overflow-hidden rounded-[26px] border border-[#2f3b69]/10 bg-[#f8f8fb]" style={{ boxShadow: "0px 3px 8px rgba(0,0,0,0.12)" }}>
      <View className="px-5 py-5">
        <View className="flex-row items-center">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-[#3E829A]">
            <Image source={logoLogin} style={{ width: 26, height: 26 }} resizeMode="contain" />
          </View>
          <Text className="ml-3 text-xl font-atkinson-bold text-[#2f3b69]">Sobre o projeto</Text>
        </View>

        <Text className="mt-5 text-[15px] leading-7 text-zinc-600 font-atkinson">
          A Linka é um aplicativo pensado para conectar estudantes, projetos, empresas, mentores e oportunidades em um único ambiente.
        </Text>

        <View className="mt-5 gap-3">
          {projectFeatures.map(({ icon, title, desc }) => (
            <View key={title} className="rounded-2xl border border-[#2f3b69]/10 bg-white px-4 py-4">
              <View className="flex-row items-center">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-[#ffde59]/20">
                  <FontAwesome name={icon} size={16} color="#3E829A" />
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-base font-atkinson-bold text-[#3E829A]">{title}</Text>
                  <Text className="mt-1 text-sm leading-5 text-zinc-600 font-atkinson">{desc}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
