import FontAwesome from "@expo/vector-icons/FontAwesome";
import { Image, View } from "react-native";
import { AccessibleText } from "@/shared/components/ui/base/accessible-text";

import logoLogin from "@/assets/images/logoLight.png";

import { projectFeatures } from "../about.data";

export function ProjectSection() {
  return (
    <View className="mt-7 overflow-hidden rounded-[26px] border border-[#2f3b69]/10 bg-[#f8f8fb] dark:bg-[#2F3B69]" style={{ boxShadow: "0px 3px 8px rgba(0,0,0,0.12)" }}>
      <View className="px-5 py-5">
        <View className="flex-row items-center">
          <View className="h-11 w-11 items-center justify-center rounded-full bg-[#3E829A]">
            <Image source={logoLogin} style={{ width: 26, height: 26 }} resizeMode="contain" />
          </View>
          <AccessibleText className="ml-3 text-xl font-atkinson-bold text-[#2f3b69] dark:text-blue-100">Sobre o projeto</AccessibleText>
        </View>

        <AccessibleText className="mt-5 text-[15px] leading-7 text-zinc-600 dark:text-zinc-300 font-atkinson">
          A Linka é um aplicativo pensado para conectar estudantes, projetos, empresas, mentores e oportunidades em um único ambiente.
        </AccessibleText>

        <View className="mt-5 gap-3">
          {projectFeatures.map(({ icon, title, desc }) => (
            <View key={title} className="rounded-2xl border border-[#2f3b69]/10 bg-white dark:bg-zinc-900 px-4 py-4">
              <View className="flex-row items-center">
                <View className="h-9 w-9 items-center justify-center rounded-full bg-[#ffde59]/20">
                  <FontAwesome name={icon} size={16} color="#3E829A" />
                </View>
                <View className="ml-3 flex-1">
                  <AccessibleText className="text-base font-atkinson-bold text-[#3E829A] dark:text-zinc-300">{title}</AccessibleText>
                  <AccessibleText className="mt-1 text-sm leading-5 text-zinc-600 dark:text-zinc-300 font-atkinson">{desc}</AccessibleText>
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}
