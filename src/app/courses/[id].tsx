import { router, useLocalSearchParams } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function CourseDetailsPlaceholderScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 justify-center gap-4 px-6">
        <Text className="text-2xl font-bold text-[#002B5B]">
          Detalhe do curso
        </Text>
        <Text className="text-base leading-6 text-zinc-600">
          A navegação para o curso já está pronta. A tela completa de detalhes e
          inscrição deve ser implementada na próxima issue.
        </Text>
        <Text className="text-sm text-zinc-500">ID do curso: {id}</Text>

        <TouchableOpacity
          activeOpacity={0.85}
          className="self-start rounded-xl bg-[#002B5B] px-5 py-3"
          onPress={() => router.back()}
        >
          <Text className="font-bold text-white">Voltar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
