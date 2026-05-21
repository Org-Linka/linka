import { router } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";

export default function OpportunitiesScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-white px-6">
      <Text className="text-center text-2xl font-bold text-zinc-900">
        Oportunidades de emprego mais relevantes para o usuário com filtros
      </Text>
      <TouchableOpacity
        className="rounded-xl bg-[#2f3b69] px-5 py-3"
        activeOpacity={0.9}
        onPress={() => router.push("/login")}
      >
        <Text className="font-semibold text-white">Voltar para login</Text>
      </TouchableOpacity>
    </View>
  );
}
